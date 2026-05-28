import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp, validateUsername, apiRes } from '@/lib/api-helpers';

export async function GET(req: Request) {
  const ip = getClientIp(req);
  // Rate limit: prevents username enumeration (scraping taken usernames)
  if (!await checkRateLimit(`check-username:${ip}`, 20, 60_000)) return apiRes.rateLimited();

  const url = new URL(req.url);
  const username = validateUsername(url.searchParams.get('username') ?? '');
  if (!username) return NextResponse.json({ available: false });

  const existing = await prisma.creator.findUnique({ where: { username }, select: { id: true } });
  return NextResponse.json({ available: !existing });
}
