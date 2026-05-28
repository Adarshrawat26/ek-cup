import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupees(amountPaise: number): string {
  return `₹${(amountPaise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

// ─── Platform fee ─────────────────────────────────────────────────────────────
// The platform fee percentage is stored in PlatformConfig (key: "platform_fee_percent")
// and is admin-controlled. Use lib/platform-config.ts for any fee calculation:
//
//   getPlatformFeePercent()          → current fee % (cached, async)
//   creatorNetAmountAsync(paise)     → net paise after fee (async)
//   applyFee(paise, feePercent)      → { net, fee } when percent is already known
//
// Do NOT use hardcoded fee constants here — they will silently diverge from the DB.

export function parsePerks(perks: string | string[]): string[] {
  if (Array.isArray(perks)) return perks.filter(Boolean);
  try {
    const parsed: unknown = JSON.parse(perks);
    if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
  } catch {
    // fallthrough to comma-split
  }
  return perks.split(',').map((p) => p.trim()).filter(Boolean);
}