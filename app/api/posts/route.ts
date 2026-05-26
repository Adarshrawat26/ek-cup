import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  checkRateLimit,
  getClientIp,
  checkOwnership,
  validateStr,
  apiRes,
} from '@/lib/api-helpers';

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`posts:${ip}`, 20, 60_000)) return apiRes.rateLimited();

  const body = await req.json().catch(() => ({}));
  const { creatorId, title, body: content, audience } = body as Record<string, unknown>;

  if (!creatorId || typeof creatorId !== 'string') return apiRes.badRequest('creatorId is required.');

  const validTitle = validateStr(title, 1, 200);
  if (!validTitle) return apiRes.badRequest('Title is required (max 200 characters).');

  const validContent = validateStr(content, 1, 10_000);
  if (!validContent) return apiRes.badRequest('Content is required (max 10,000 characters).');

  const access = await checkOwnership(creatorId);
  if (access === 'unauthorized') return apiRes.unauthorized();
  if (access === 'forbidden') return apiRes.forbidden();

  const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
  if (!creator) return apiRes.notFound('Creator not found.');

  const post = await prisma.creatorPost.create({
    data: {
      creatorId,
      title: validTitle,
      body: validContent,
      audience: audience === 'members' ? 'members' : 'public',
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
