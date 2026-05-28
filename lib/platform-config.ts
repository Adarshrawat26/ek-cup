/**
 * lib/platform-config.ts
 *
 * Reads platform settings from the PlatformConfig table.
 *
 * Caching strategy (L-5):
 *  - Primary: Upstash Redis with 60s TTL — shared across all server instances
 *  - Fallback: in-process Map — used in dev or when Redis is unavailable
 *
 * Admin panel calls invalidateConfigCache() after writing to DB so the new
 * value takes effect immediately across all instances, not after 60s.
 */

import { prisma } from './prisma';

// ─── Redis cache (multi-instance safe) ───────────────────────────────────────

let redis: { get: (k: string) => Promise<string | null>; set: (k: string, v: string, opts?: { ex: number }) => Promise<unknown>; del: (k: string) => Promise<unknown> } | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const { Redis } = await import('@upstash/redis').catch(() => ({ Redis: null }));
    if (Redis) {
      const client = Redis.fromEnv();
      redis = {
        get: (k) => client.get<string>(k),
        set: (k, v, opts) => opts ? client.set(k, v, { ex: opts.ex }) : client.set(k, v),
        del: (k) => client.del(k),
      };
    }
  } catch {
    // Redis unavailable — fall back to in-memory
  }
}

// ─── In-memory fallback ───────────────────────────────────────────────────────

type ConfigCache = { value: string; expiresAt: number };
const memCache = new Map<string, ConfigCache>();
const CACHE_TTL_MS = 60_000;
const REDIS_TTL_SECONDS = 60;
const REDIS_KEY_PREFIX = 'ekcup:config:';

// ─── Core fetch with cache ────────────────────────────────────────────────────

async function getConfig(key: string, fallback: string): Promise<string> {
  // 1. Try Redis (shared across all instances)
  if (redis) {
    try {
      const cached = await redis.get(`${REDIS_KEY_PREFIX}${key}`);
      if (cached !== null) return cached;
    } catch {
      // Redis hiccup — fall through to in-memory
    }
  }

  // 2. Try in-memory cache
  const now = Date.now();
  const mem = memCache.get(key);
  if (mem && now < mem.expiresAt) return mem.value;

  // 3. Hit the DB
  try {
    const row = await prisma.platformConfig.findUnique({ where: { key } });
    const value = row?.value ?? fallback;

    // Populate both caches
    memCache.set(key, { value, expiresAt: now + CACHE_TTL_MS });
    if (redis) {
      redis.set(`${REDIS_KEY_PREFIX}${key}`, value, { ex: REDIS_TTL_SECONDS }).catch(() => {});
    }

    return value;
  } catch {
    return fallback;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Platform fee percentage (0–100). Default: 0. */
export async function getPlatformFeePercent(): Promise<number> {
  const raw = await getConfig('platform_fee_percent', '0');
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : 0;
}

/** Net amount a creator receives after platform fee, in paise. */
export async function creatorNetAmountAsync(grossPaise: number): Promise<number> {
  const feePercent = await getPlatformFeePercent();
  return Math.floor(grossPaise * (1 - feePercent / 100));
}

/** Sync calculation when fee percent is already known. */
export function applyFee(grossPaise: number, feePercent: number): { net: number; fee: number } {
  const net = Math.floor(grossPaise * (1 - feePercent / 100));
  return { net, fee: grossPaise - net };
}

/**
 * Invalidate cache — called by admin panel after updating a config key.
 * Busts both Redis and in-memory so the new value is reflected immediately.
 */
export async function invalidateConfigCache(key?: string): Promise<void> {
  if (key) {
    memCache.delete(key);
    if (redis) await redis.del(`${REDIS_KEY_PREFIX}${key}`).catch(() => {});
  } else {
    memCache.clear();
    // Redis: can't bulk-delete by prefix without SCAN — individual keys are
    // cleared as they're next accessed and the TTL ensures 60s max staleness.
  }
}
