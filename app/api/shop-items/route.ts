import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  checkRateLimit,
  getClientIp,
  checkOwnership,
  validateStr,
  validateNum,
  validateUrl,
  apiRes,
} from '@/lib/api-helpers';

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`shop-items:${ip}`, 20, 60_000)) return apiRes.rateLimited();

  const body = await req.json().catch(() => ({}));
  const { creatorId, name, description, price, deliveryUrl } = body as Record<string, unknown>;

  if (!creatorId || typeof creatorId !== 'string') return apiRes.badRequest('creatorId is required.');

  const validName = validateStr(name, 1, 150);
  if (!validName) return apiRes.badRequest('Name is required (max 150 characters).');

  const validDesc = validateStr(description, 1, 2000);
  if (!validDesc) return apiRes.badRequest('Description is required (max 2,000 characters).');

  const parsedPrice = validateNum(price, 0, 100_000);
  if (parsedPrice === null) return apiRes.badRequest('Price must be a number between 0 and 1,00,000.');

  // deliveryUrl is optional but must be valid if provided
  const safeUrl = deliveryUrl ? validateUrl(deliveryUrl) : null;
  if (deliveryUrl && !safeUrl) return apiRes.badRequest('deliveryUrl must be a valid https:// URL.');

  const access = await checkOwnership(creatorId);
  if (access === 'unauthorized') return apiRes.unauthorized();
  if (access === 'forbidden') return apiRes.forbidden();

  const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
  if (!creator) return apiRes.notFound('Creator not found.');

  const item = await prisma.shopItem.create({
    data: {
      creatorId,
      name: validName,
      description: validDesc,
      priceInPaise: Math.round(parsedPrice * 100),
      deliveryUrl: safeUrl,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
