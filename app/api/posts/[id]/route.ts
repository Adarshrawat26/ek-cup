import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  checkRateLimit,
  getClientIp,
  checkOwnership,
  validateStr,
  apiRes,
} from '@/lib/api-helpers';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`posts-patch:${ip}`, 30, 60_000)) return apiRes.rateLimited();

  const { id } = await params;
  const post = await prisma.creatorPost.findUnique({ where: { id } });
  if (!post) return apiRes.notFound('Post not found.');

  const access = await checkOwnership(post.creatorId);
  if (access === 'unauthorized') return apiRes.unauthorized();
  if (access === 'forbidden') return apiRes.forbidden();

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) {
    const t = validateStr(body.title, 1, 200);
    if (!t) return apiRes.badRequest('Title must be 1–200 characters.');
    updates.title = t;
  }
  if (body.body !== undefined) {
    const b = validateStr(body.body, 1, 10_000);
    if (!b) return apiRes.badRequest('Content must be 1–10,000 characters.');
    updates.body = b;
  }
  if (body.audience !== undefined) {
    updates.audience = body.audience === 'members' ? 'members' : 'public';
  }

  if (Object.keys(updates).length === 0) return apiRes.badRequest('No valid fields to update.');

  const updated = await prisma.creatorPost.update({ where: { id }, data: updates });
  return NextResponse.json({ post: updated });
}

export async function DELETE(req: Request, { params }: Params) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`posts-delete:${ip}`, 20, 60_000)) return apiRes.rateLimited();

  const { id } = await params;
  const post = await prisma.creatorPost.findUnique({ where: { id } });
  if (!post) return apiRes.notFound('Post not found.');

  const access = await checkOwnership(post.creatorId);
  if (access === 'unauthorized') return apiRes.unauthorized();
  if (access === 'forbidden') return apiRes.forbidden();

  await prisma.creatorPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
