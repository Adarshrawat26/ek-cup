import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

/**
 * GET /api/creators/:username/supporters
 *
 * Cursor-based pagination — safe for large supporter lists.
 *
 * Query params:
 *   limit  - number of items (default 10, max 50)
 *   cursor - id of the last item from the previous page (omit for first page)
 *
 * Response:
 *   { supports: [...], nextCursor: string | null, hasMore: boolean }
 */
export async function GET(req: Request, { params }: { params: { username: string } }) {
  const { username } = params;

  const url = new URL(req.url);
  const rawLimit = parseInt(url.searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);
  const limit = Math.min(Math.max(1, isNaN(rawLimit) ? DEFAULT_LIMIT : rawLimit), MAX_LIMIT);
  const cursor = url.searchParams.get('cursor') ?? undefined;

  const creator = await prisma.creator.findUnique({ where: { username }, select: { id: true } });
  if (!creator) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Fetch one extra record to determine if there's a next page
  const supports = await prisma.support.findMany({
    where: { creatorId: creator.id },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor
      ? { cursor: { id: cursor }, skip: 1 } // skip the cursor item itself
      : {}),
    select: {
      id: true,
      supporterName: true,
      message: true,
      amount: true,
      cups: true,
      createdAt: true,
    },
  });

  const hasMore = supports.length > limit;
  const page = supports.slice(0, limit);
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  return NextResponse.json({ supports: page, hasMore, nextCursor });
}
