import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  checkRateLimit,
  getClientIp,
  getAuthenticatedCreator,
  validateStr,
  validateUrl,
  apiRes,
} from '@/lib/api-helpers';

type Params = { params: Promise<{ username: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { username } = await params;
  const creator = await prisma.creator.findUnique({
    where: { username },
    include: { memberships: true },
  });
  if (!creator) return apiRes.notFound();

  return NextResponse.json({
    id: creator.id,
    username: creator.username,
    name: creator.name,
    onboardingComplete: creator.onboardingComplete,
  });
}

/**
 * PATCH /api/creators/[username]
 * Update mutable profile fields. Only the owner can do this.
 */
export async function PATCH(req: Request, { params }: Params) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`creator-patch:${ip}`, 20, 60_000)) return apiRes.rateLimited();

  const { username } = await params;
  const creator = await prisma.creator.findUnique({ where: { username } });
  if (!creator) return apiRes.notFound('Creator not found.');

  const authed = await getAuthenticatedCreator();
  if (authed) {
    if (authed.id !== creator.id) return apiRes.forbidden();
  } else if (process.env.NODE_ENV === 'production') {
    return apiRes.unauthorized();
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const n = validateStr(body.name, 1, 100);
    if (!n) return apiRes.badRequest('Name must be 1–100 characters.');
    updates.name = n;
  }
  if (body.bio !== undefined) {
    const b = validateStr(body.bio, 0, 500);
    updates.bio = b ?? null;
  }
  if (body.avatarUrl !== undefined) {
    const u = body.avatarUrl ? validateUrl(body.avatarUrl) : null;
    if (body.avatarUrl && !u) return apiRes.badRequest('avatarUrl must be a valid https:// URL.');
    updates.avatarUrl = u;
  }
  if (body.tags !== undefined) {
    const raw = Array.isArray(body.tags) ? body.tags : String(body.tags ?? '').split(',');
    updates.tags = raw.map((t: unknown) => String(t).trim()).filter(Boolean).join(',');
  }
  if (body.instagramUrl !== undefined) {
    const u = body.instagramUrl ? validateUrl(body.instagramUrl) : null;
    if (body.instagramUrl && !u) return apiRes.badRequest('instagramUrl must be a valid https:// URL.');
    updates.instagramUrl = u;
  }
  if (body.youtubeUrl !== undefined) {
    const u = body.youtubeUrl ? validateUrl(body.youtubeUrl) : null;
    if (body.youtubeUrl && !u) return apiRes.badRequest('youtubeUrl must be a valid https:// URL.');
    updates.youtubeUrl = u;
  }
  if (body.twitterUrl !== undefined) {
    const u = body.twitterUrl ? validateUrl(body.twitterUrl) : null;
    if (body.twitterUrl && !u) return apiRes.badRequest('twitterUrl must be a valid https:// URL.');
    updates.twitterUrl = u;
  }

  if (Object.keys(updates).length === 0) return apiRes.badRequest('No valid fields to update.');

  const updated = await prisma.creator.update({
    where: { username },
    data: { ...updates, updatedAt: new Date() },
  });

  return NextResponse.json({ creator: updated });
}
