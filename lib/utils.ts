import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupees(amountPaise: number): string {
  return `₹${(amountPaise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
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