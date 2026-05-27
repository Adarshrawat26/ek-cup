/**
 * lib/platform-config.ts
 *
 * Reads platform settings from the PlatformConfig table.
 * Values are cached for 60 seconds so every payment doesn't hit the DB.
 * Admin panel writes to this table — changes take effect within 60s.
 */

import { prisma } from './prisma';

type ConfigCache = { value: string; expiresAt: number };
const cache = new Map<string, ConfigCache>();
const CACHE_TTL_MS = 60_000; // 60 seconds

async function getConfig(key: string, fallback: string): Promise<string> {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now < cached.expiresAt) return cached.value;

  try {
    const row = await prisma.platformConfig.findUnique({ where: { key } });
    const value = row?.value ?? fallback;
    cache.set(key, { value, expiresAt: now + CACHE_TTL_MS });
    return value;
  } catch {
    return fallback;
  }
}

/** Platform fee percentage (0–100). Default: 0. Updates within 60s of admin change. */
export async function getPlatformFeePercent(): Promise<number> {
  const raw = await getConfig('platform_fee_percent', '0');
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : 0;
}

/** Returns the net amount a creator receives after platform fee, in paise. */
export async function creatorNetAmountAsync(grossPaise: number): Promise<number> {
  const feePercent = await getPlatformFeePercent();
  return Math.floor(grossPaise * (1 - feePercent / 100));
}

/** Sync version using a pre-fetched fee percent — use when you already have the value. */
export function applyFee(grossPaise: number, feePercent: number): { net: number; fee: number } {
  const net = Math.floor(grossPaise * (1 - feePercent / 100));
  return { net, fee: grossPaise - net };
}

/** Invalidate cache — called by admin panel after updating config. */
export function invalidateConfigCache(key?: string) {
  if (key) cache.delete(key);
  else cache.clear();
}
