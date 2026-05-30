import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { checkRateLimit, getClientIp, apiRes } from '@/lib/api-helpers';

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`onboarding-complete:${ip}`, 10, 60_000)) return apiRes.rateLimited();

  try {
    const body = await req.json();
    const creatorId = body?.creatorId;
    if (!creatorId) return apiRes.badRequest('creatorId is required.');

    const session = await getSession();
    if (!session?.user?.id && process.env.NODE_ENV === 'production') {
      return apiRes.unauthorized();
    }

    // If authenticated, verify this creatorId belongs to the session user
    if (session?.user?.id) {
      const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
      if (!creator) return apiRes.notFound('Creator not found.');
      if (creator.userId && creator.userId !== session.user.id) return apiRes.forbidden();
    }

    await prisma.creator.update({ where: { id: creatorId }, data: { onboardingComplete: true } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[onboarding-complete]', err);
    return apiRes.serverError();
  }
}
