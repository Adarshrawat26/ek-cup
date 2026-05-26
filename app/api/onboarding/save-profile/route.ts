import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, getClientIp, validateStr, validateUsername, apiRes } from '@/lib/api-helpers';

type SaveProfileBody = {
  name?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  tags?: string[];
  socialLink?: string;
  userId?: string;
};

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`onboarding-profile:${ip}`, 10, 60_000)) return apiRes.rateLimited();

  try {
    const body: SaveProfileBody = await req.json();
    const { name, username, bio, avatarUrl, tags, socialLink, userId } = body;

    const validUsername = validateUsername(username);
    if (!validUsername) {
      return apiRes.badRequest('Username must be 3–30 characters (letters, numbers, - and _ only).');
    }

    const validName = validateStr(name ?? validUsername, 1, 100);
    if (!validName) return apiRes.badRequest('Name must be 1–100 characters.');

    const session = await getServerSession(authOptions);

    // In production, require a session. In dev, allow demo flow.
    if (!session?.user?.id && process.env.NODE_ENV === 'production') {
      return apiRes.unauthorized();
    }

    // If authenticated, the userId in the body must match the session
    if (session?.user?.id && userId && session.user.id !== userId) {
      return apiRes.forbidden();
    }

    const effectiveUserId = session?.user?.id ?? userId;

    const profileData = {
      name: validName,
      username: validUsername,
      bio: validateStr(bio ?? '', 0, 500) ?? null,
      avatarUrl: avatarUrl || null,
      tags: Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean).join(',') : '',
      twitterUrl: socialLink || null,
    };

    const creator = await prisma.creator.upsert({
      where: { username: validUsername },
      update: { ...profileData, updatedAt: new Date() },
      create: { ...profileData, handle: validUsername, userId: effectiveUserId ?? undefined },
    });

    return NextResponse.json({ success: true, creatorId: creator.id });
  } catch (err) {
    console.error('[save-profile]', err);
    return apiRes.serverError();
  }
}
