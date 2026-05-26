import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, getClientIp, validateUsername, apiRes } from '@/lib/api-helpers';

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`onboarding-complete:${ip}`, 10, 60_000)) return apiRes.rateLimited();

  try {
    const body = await req.json();
    const username = validateUsername(body?.username);
    if (!username) return apiRes.badRequest('Valid username is required.');

    const session = await getServerSession(authOptions);
    if (!session?.user?.id && process.env.NODE_ENV === 'production') {
      return apiRes.unauthorized();
    }

    // If authenticated, verify this username belongs to the session user
    if (session?.user?.id) {
      const creator = await prisma.creator.findUnique({ where: { username } });
      if (!creator) return apiRes.notFound('Creator not found.');
      if (creator.userId && creator.userId !== session.user.id) return apiRes.forbidden();
    }

    await prisma.creator.update({ where: { username }, data: { onboardingComplete: true } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[onboarding-complete]', err);
    return apiRes.serverError();
  }
}
