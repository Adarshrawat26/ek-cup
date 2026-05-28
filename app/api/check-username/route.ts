import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/api-helpers';

export async function GET(req: Request) {
  // M-1: Rate limit — prevents username enumeration attacks (scraping taken usernames)
  const ip = getClientIp(req);
  if (!await checkRateLimit(`check-username:${ip}`, 20, 60_000)) {
    return NextResponse.json({ available: false }, { status: 429 });
  }

  const url = new URL(req.url);
  const username = url.searchParams.get('username')?.toLowerCase() || '';
  if (!username || username.length < 3) return NextResponse.json({ available: false });

  const existing = await prisma.creator.findUnique({ where: { username } });
  return NextResponse.json({ available: !existing });
}
