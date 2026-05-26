import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const username = url.searchParams.get('username')?.toLowerCase() || '';
  if (!username || username.length < 3) return NextResponse.json({ available: false });

  const existing = await prisma.creator.findUnique({ where: { username } });
  return NextResponse.json({ available: !existing });
}
