/**
 * lib/prisma.ts — Singleton Prisma client
 *
 * Next.js hot-reloads modules in dev, which would create a new PrismaClient
 * (and a new connection pool) on every file save. We stash the instance on
 * globalThis so only one client is ever created per process.
 *
 * In production (serverless), each invocation is a fresh process anyway,
 * so the global guard is a no-op — it just keeps TypeScript happy.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
