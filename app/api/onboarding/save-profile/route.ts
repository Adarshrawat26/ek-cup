import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { checkRateLimit, getClientIp, validateStr, validateUrl, validateUsername, apiRes } from '@/lib/api-helpers';

type SaveProfileBody = {
  name?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  tags?: string[];
  socialLink?: string;
  // userId is intentionally not accepted — always sourced from the server session
};

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`onboarding-profile:${ip}`, 10, 60_000)) return apiRes.rateLimited();

  try {
    const body: SaveProfileBody = await req.json();
    const { name, username, bio, avatarUrl, tags, socialLink } = body;

    const validUsername = validateUsername(username);
    if (!validUsername) {
      return apiRes.badRequest('Username must be 3–30 characters (letters, numbers, - and _ only).');
    }

    const validName = validateStr(name ?? validUsername, 1, 100);
    if (!validName) return apiRes.badRequest('Name must be 1–100 characters.');

    // SECURITY (M-5): Never trust userId from the client body.
    // Always source identity from the server session exclusively.
    const session = await getSession();

    if (!session?.user?.id && process.env.NODE_ENV === 'production') {
      return apiRes.unauthorized();
    }

    const effectiveUserId = session?.user?.id ?? undefined;

    // SECURITY (H-4): Validate avatarUrl — prevents SSRF via image optimisation
    // and stored XSS. Uses the same validateUrl helper used everywhere else.
    const safeAvatarUrl = avatarUrl ? validateUrl(avatarUrl) : null;
    if (avatarUrl && !safeAvatarUrl) {
      return apiRes.badRequest('avatarUrl must be a valid https:// URL.');
    }

    const profileData = {
      name: validName,
      username: validUsername,
      bio: validateStr(bio ?? '', 0, 500) ?? null,
      avatarUrl: safeAvatarUrl,
      tags: Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean).join(',') : '',
      twitterUrl: socialLink ? validateUrl(socialLink) : null,
    };

    const creator = await prisma.creator.upsert({
      where: { username: validUsername },
      update: { ...profileData, updatedAt: new Date() },
      create: { ...profileData, userId: effectiveUserId },
    });

    return NextResponse.json({ success: true, creatorId: creator.id });
  } catch (err) {
    console.error('[save-profile]', err);
    return apiRes.serverError();
  }
}
