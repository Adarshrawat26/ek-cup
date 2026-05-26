/**
 * lib/prisma.ts
 *
 * Singleton Prisma client with optional Prisma Accelerate support.
 *
 * Prisma Accelerate (free tier) adds:
 *  - Connection pooling — critical for serverless (Vercel/Railway)
 *  - Global edge caching — creator queries served from nearest PoP
 *  - Zero config — just swap DATABASE_URL for the Accelerate proxy URL
 *
 * Setup:
 *  1. Go to https://pris.ly/accelerate → create a project → copy the URL
 *  2. Replace DATABASE_URL in your hosting env with:
 *       DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=<key>"
 *  3. That's it — this file auto-detects the protocol and enables the extension.
 *
 * Local dev: keep DATABASE_URL="file:./dev.db" — Accelerate is skipped.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

async function buildClient(): Promise<PrismaClient> {
  const isAccelerate = process.env.DATABASE_URL?.startsWith('prisma://');

  if (isAccelerate) {
    try {
      const { withAccelerate } = await import('@prisma/extension-accelerate');
      return new PrismaClient().$extends(withAccelerate()) as unknown as PrismaClient;
    } catch {
      console.warn('[prisma] @prisma/extension-accelerate not found — falling back to direct connection.');
    }
  }

  return new PrismaClient();
}

// In Next.js dev mode the module is hot-reloaded, so we stash the client on
// globalThis to avoid opening a new DB connection on every reload.
export const prisma: PrismaClient =
  globalForPrisma.prisma ?? (await buildClient());

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
