import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  checkRateLimit,
  getClientIp,
  checkOwnership,
  validateStr,
  validateNum,
  normalisePerks,
  apiRes,
} from '@/lib/api-helpers';

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`memberships:${ip}`, 20, 60_000)) return apiRes.rateLimited();

  const body = await req.json().catch(() => ({}));
  const { creatorId, name, price, perks } = body as Record<string, unknown>;

  const validName = validateStr(name, 1, 100);
  if (!validName) return apiRes.badRequest('Name is required (max 100 characters).');
  if (!creatorId || typeof creatorId !== 'string') return apiRes.badRequest('creatorId is required.');

  const access = await checkOwnership(creatorId);
  if (access === 'unauthorized') return apiRes.unauthorized();
  if (access === 'forbidden') return apiRes.forbidden();

  // L-2: checkOwnership already fetched the creator object — reuse it to avoid N+1
  const creator = access !== 'demo'
    ? access
    : await prisma.creator.findUnique({ where: { id: creatorId } });
  if (!creator) return apiRes.notFound('Creator not found.');

  const parsedPrice = validateNum(price, 0, 100_000);
  if (parsedPrice === null) return apiRes.badRequest('Price must be a number between 0 and 1,00,000.');

  const membership = await prisma.membership.create({
    data: {
      creatorId: creator.id,
      name: validName,
      priceInPaise: Math.round(parsedPrice * 100),
      perks: JSON.stringify(normalisePerks(perks)),
    },
  });

  return NextResponse.json({ membership }, { status: 201 });
}
