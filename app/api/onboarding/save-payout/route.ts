import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { checkRateLimit, getClientIp, validateStr, apiRes } from '@/lib/api-helpers';

type SavePayoutBody = {
  creatorId?: string;
  upiId?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
  bankName?: string;
};

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`onboarding-payout:${ip}`, 10, 60_000)) return apiRes.rateLimited();

  try {
    const body: SavePayoutBody = await req.json();
    const { creatorId, upiId, accountHolder, accountNumber, ifsc, bankName } = body;

    if (!creatorId) return apiRes.badRequest('creatorId is required.');

    const session = await getSession();
    if (!session?.user?.id && process.env.NODE_ENV === 'production') {
      return apiRes.unauthorized();
    }

    // If authenticated, ensure the creatorId belongs to the session user
    if (session?.user?.id) {
      const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
      if (!creator) return apiRes.notFound('Creator not found.');
      if (creator.userId && creator.userId !== session.user.id) return apiRes.forbidden();
    }

    // Validate payout fields
    const payoutFields = {
      upiId: validateStr(upiId ?? '', 0, 100) ?? null,
      accountHolder: validateStr(accountHolder ?? '', 0, 100) ?? null,
      // Account number: digits only, 9-18 chars
      accountNumber: accountNumber
        ? /^\d{9,18}$/.test(accountNumber.trim()) ? accountNumber.trim() : null
        : null,
      // IFSC: standard 11-char Indian format
      ifsc: ifsc
        ? /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc.trim()) ? ifsc.trim().toUpperCase() : null
        : null,
      bankName: validateStr(bankName ?? '', 0, 100) ?? null,
    };

    await prisma.creatorPayout.upsert({
      where: { creatorId },
      update: payoutFields,
      create: { creatorId, ...payoutFields },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[save-payout]', err);
    return apiRes.serverError();
  }
}
