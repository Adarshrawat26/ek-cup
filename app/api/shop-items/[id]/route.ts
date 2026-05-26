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

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`shop-patch:${ip}`, 30, 60_000)) return apiRes.rateLimited();

  const item = await prisma.shopItem.findUnique({ where: { id: params.id } });
  if (!item) return apiRes.notFound('Shop item not found.');

  const access = await checkOwnership(item.creatorId);
  if (access === 'unauthorized') return apiRes.unauthorized();
  if (access === 'forbidden') return apiRes.forbidden();

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const n = validateStr(body.name, 1, 150);
    if (!n) return apiRes.badRequest('Name must be 1–150 characters.');
    updates.name = n;
  }
  if (body.description !== undefined) {
    const d = validateStr(body.description, 1, 2000);
    if (!d) return apiRes.badRequest('Description must be 1–2,000 characters.');
    updates.description = d;
  }
  if (body.price !== undefined) {
    const p = validateNum(body.price, 0, 100_000);
    if (p === null) return apiRes.badRequest('Price must be 0–1,00,000.');
    updates.priceInPaise = Math.round(p * 100);
  }
  if (body.deliveryUrl !== undefined) {
    const u = validateUrl(body.deliveryUrl);
    if (body.deliveryUrl && !u) return apiRes.badRequest('deliveryUrl must be a valid https:// URL.');
    updates.deliveryUrl = u;
  }

  if (Object.keys(updates).length === 0) return apiRes.badRequest('No valid fields to update.');

  const updated = await prisma.shopItem.update({ where: { id: params.id }, data: updates });
  return NextResponse.json({ item: updated });
}

export async function DELETE(req: Request, { params }: Params) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`shop-delete:${ip}`, 20, 60_000)) return apiRes.rateLimited();

  const item = await prisma.shopItem.findUnique({ where: { id: params.id } });
  if (!item) return apiRes.notFound('Shop item not found.');

  const access = await checkOwnership(item.creatorId);
  if (access === 'unauthorized') return apiRes.unauthorized();
  if (access === 'forbidden') return apiRes.forbidden();

  await prisma.shopItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
