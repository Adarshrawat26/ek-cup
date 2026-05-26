/**
 * api-helpers.ts
 *
 * Central security utilities for all API routes:
 *  - In-memory rate limiter
 *  - Session / ownership guards
 *  - Input validators
 *  - Typed response shortcuts
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Creator } from '@prisma/client';
import { authOptions } from './auth';
import { prisma } from './prisma';

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
// Delegates to lib/rate-limit.ts which uses Upstash Redis when configured
// (multi-instance safe) and falls back to an in-memory Map for local dev.
// Re-exported here so existing import paths don't need to change.
export { checkRateLimit } from './rate-limit';

/** Extract the real client IP from common proxy headers. */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

// ─── Auth / Ownership Guards ──────────────────────────────────────────────────

/** Returns the authenticated creator or null (not logged in / no creator yet). */
export async function getAuthenticatedCreator(): Promise<Creator | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return prisma.creator.findFirst({ where: { userId: session.user.id } });
}

/**
 * Gate a mutation that targets a specific creator resource.
 *
 * Rules:
 *  1. Authenticated + owner  → ✅ allowed  (returns creator)
 *  2. Authenticated + not owner → ❌ forbidden (returns 'forbidden')
 *  3. Unauthenticated + dev  → ✅ allowed as demo (returns 'demo')
 *  4. Unauthenticated + prod → ❌ unauthorized (returns 'unauthorized')
 */
export async function checkOwnership(
  resourceCreatorId: string
): Promise<Creator | 'demo' | 'forbidden' | 'unauthorized'> {
  const creator = await getAuthenticatedCreator();

  if (creator) {
    return creator.id === resourceCreatorId ? creator : 'forbidden';
  }

  // No session
  if (process.env.NODE_ENV !== 'production') return 'demo';
  return 'unauthorized';
}

// ─── Response Helpers ─────────────────────────────────────────────────────────

export const apiRes = {
  ok: <T>(data: T, status = 200) => NextResponse.json(data, { status }),
  unauthorized: () => NextResponse.json({ error: 'Unauthorized — please sign in.' }, { status: 401 }),
  forbidden: () => NextResponse.json({ error: 'Forbidden — you do not own this resource.' }, { status: 403 }),
  notFound: (msg = 'Not found') => NextResponse.json({ error: msg }, { status: 404 }),
  badRequest: (msg = 'Bad request') => NextResponse.json({ error: msg }, { status: 400 }),
  rateLimited: () =>
    NextResponse.json({ error: 'Too many requests — please slow down.' }, { status: 429 }),
  serverError: (msg = 'Internal server error') =>
    NextResponse.json({ error: msg }, { status: 500 }),
} as const;

// ─── Input Validators ─────────────────────────────────────────────────────────

/** Trims and validates a string, returning null if out of range. */
export function validateStr(val: unknown, min = 1, max = 500): string | null {
  if (typeof val !== 'string') return null;
  const s = val.trim();
  if (s.length < min || s.length > max) return null;
  return s;
}

/** Validates a finite number within bounds. */
export function validateNum(val: unknown, min = 0, max = 10_000_000): number | null {
  const n = Number(val);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

/** Validates a fully-qualified HTTP/HTTPS URL. */
export function validateUrl(val: unknown): string | null {
  if (!val || typeof val !== 'string' || !val.trim()) return null;
  try {
    const u = new URL(val.trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Validates a username slug: 3-30 lowercase alphanumeric, dash, or underscore. */
export function validateUsername(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  const s = val.trim().toLowerCase();
  if (s.length < 3 || s.length > 30) return null;
  if (!/^[a-z0-9_-]+$/.test(s)) return null;
  return s;
}

/** Coerces a perks value (array or newline-/comma-string) to a clean string[]. */
export function normalisePerks(perks: unknown): string[] {
  if (Array.isArray(perks)) return perks.filter((p) => typeof p === 'string' && p.trim()).map(String);
  if (typeof perks === 'string') {
    return perks
      .split(/[\n,]/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [];
}
