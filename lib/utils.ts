import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupees(amountPaise: number): string {
  return `₹${(amountPaise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

// ─── Platform fee ─────────────────────────────────────────────────────────────
// Ek Cup takes a 5% platform fee on every successful payment.
// All amounts are stored in paise (1 INR = 100 paise).

export const PLATFORM_FEE_PERCENT = 5;

/**
 * Returns how much the creator receives after the platform fee.
 * Uses Math.floor so we never overpay the creator.
 * e.g. ₹100 gross → ₹95 net, ₹5 platform fee
 */
export function creatorNetAmount(grossPaise: number): number {
  return Math.floor(grossPaise * (1 - PLATFORM_FEE_PERCENT / 100));
}

/**
 * Returns the platform fee amount in paise.
 * e.g. ₹100 gross → ₹5 fee
 */
export function platformFeeAmount(grossPaise: number): number {
  return grossPaise - creatorNetAmount(grossPaise);
}

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