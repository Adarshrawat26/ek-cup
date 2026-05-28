import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/api-helpers';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

/**
 * GET /api/creators/:username/supporters
 * Cursor-based pagination — safe for large supporter lists.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  // M-2: Rate limit — prevents bulk-scraping supporter PII (names, messages)
  const ip = getClientIp(req);
  if (!await checkRateLimit(`supporters:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { username } = await params;

  const url = new URL(req.url);
  const rawLimit = parseInt(url.searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);
  const limit = Math.min(Math.max(1, isNaN(rawLimit) ? DEFAULT_LIMIT : rawLimit), MAX_LIMIT);
  const cursor = url.searchParams.get('cursor') ?? undefined;

  const creator = await prisma.creator.findUnique({ where: { username }, select: { id: true } });
  if (!creator) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const supports = await prisma.support.findMany({
    where: { creatorId: creator.id },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true, supporterName: true, message: true,
      amount: true, cups: true, createdAt: true,
    },
  });

  const hasMore = supports.length > limit;
  const page = supports.slice(0, limit);
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  return NextResponse.json({ supports: page, hasMore, nextCursor });
}
