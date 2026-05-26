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

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`memberships-patch:${ip}`, 30, 60_000)) return apiRes.rateLimited();

  const membership = await prisma.membership.findUnique({ where: { id: params.id } });
  if (!membership) return apiRes.notFound('Membership not found.');

  const access = await checkOwnership(membership.creatorId);
  if (access === 'unauthorized') return apiRes.unauthorized();
  if (access === 'forbidden') return apiRes.forbidden();

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const n = validateStr(body.name, 1, 100);
    if (!n) return apiRes.badRequest('Name must be 1–100 characters.');
    updates.name = n;
  }
  if (body.price !== undefined) {
    const p = validateNum(body.price, 0, 100_000);
    if (p === null) return apiRes.badRequest('Price must be 0–1,00,000.');
    updates.priceInPaise = Math.round(p * 100);
  }
  if (body.perks !== undefined) {
    updates.perks = JSON.stringify(normalisePerks(body.perks));
  }

  if (Object.keys(updates).length === 0) return apiRes.badRequest('No valid fields to update.');

  const updated = await prisma.membership.update({ where: { id: params.id }, data: updates });
  return NextResponse.json({ membership: updated });
}

export async function DELETE(req: Request, { params }: Params) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`memberships-delete:${ip}`, 20, 60_000)) return apiRes.rateLimited();

  const membership = await prisma.membership.findUnique({ where: { id: params.id } });
  if (!membership) return apiRes.notFound('Membership not found.');

  const access = await checkOwnership(membership.creatorId);
  if (access === 'unauthorized') return apiRes.unauthorized();
  if (access === 'forbidden') return apiRes.forbidden();

  await prisma.membership.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
