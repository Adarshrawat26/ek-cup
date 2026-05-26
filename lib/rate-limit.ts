/**
 * rate-limit.ts
 *
 * Unified rate limiter that uses Upstash Redis when configured (production,
 * multi-instance safe) and falls back to an in-memory Map when not (local dev).
 *
 * Set these env vars to enable Upstash:
 *   UPSTASH_REDIS_REST_URL=https://...
 *   UPSTASH_REDIS_REST_TOKEN=...
 *
 * Free tier: https://upstash.com (10,000 req/day, no CC required)
 */

// ─── Upstash (production) ─────────────────────────────────────────────────────

let upstashRatelimit: ((key: string, limit: number, windowMs: number) => Promise<boolean>) | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Lazy-import so the package is only resolved when env vars are present.
  // This prevents import errors in environments where the package isn't installed.
  const { Ratelimit } = await import('@upstash/ratelimit').catch(() => ({ Ratelimit: null }));
  const { Redis } = await import('@upstash/redis').catch(() => ({ Redis: null }));

  if (Ratelimit && Redis) {
    const redis = Redis.fromEnv();

    // Cache limiter instances keyed by "limit:windowMs" so we don't recreate them per request
    const limiterCache = new Map<string, InstanceType<typeof Ratelimit>>();

    upstashRatelimit = async (key: string, limit: number, windowMs: number): Promise<boolean> => {
      const cacheKey = `${limit}:${windowMs}`;
      if (!limiterCache.has(cacheKey)) {
        limiterCache.set(
          cacheKey,
          new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
            prefix: 'ekcup:rl',
          })
        );
      }
      const limiter = limiterCache.get(cacheKey)!;
      const { success } = await limiter.limit(key);
      return success;
    };
  }
}

// ─── In-memory fallback (dev / single-process) ────────────────────────────────

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function inMemoryCheck(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

// Prune stale buckets every 5 minutes to avoid memory leak in long-running dev servers
setInterval(
  () => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now > bucket.resetAt) buckets.delete(key);
    }
  },
  5 * 60 * 1000
).unref?.(); // .unref() so this timer doesn't keep the process alive in tests

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns true if the request is within limits, false if it should be blocked.
 *
 * @param key      - unique identifier, e.g. `create-order:${ip}`
 * @param limit    - max requests allowed
 * @param windowMs - rolling window in milliseconds
 */
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (upstashRatelimit) return upstashRatelimit(key, limit, windowMs);
  return inMemoryCheck(key, limit, windowMs);
}
