import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendCreatorEmailNotification } from '@/lib/notifications';
import { checkRateLimit, getClientIp, validateStr, apiRes } from '@/lib/api-helpers';

type VerifyBody = {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  supporterName?: string;
  message?: string;
  cups?: number;
  demo?: boolean;
};

export async function POST(req: Request) {
  // Rate limit: 15 verifications per minute per IP
  const ip = getClientIp(req);
  if (!await checkRateLimit(`verify:${ip}`, 15, 60_000)) return apiRes.rateLimited();

  const body = await req.json().catch(() => ({})) as VerifyBody;
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, supporterName, message, cups, demo } = body;

  if (!razorpay_order_id || typeof razorpay_order_id !== 'string') {
    return apiRes.badRequest('razorpay_order_id is required.');
  }

  // Only allow demo/mock flow outside production
  const isMockOrder = razorpay_order_id.startsWith('mock_');
  const allowDemo = process.env.NODE_ENV !== 'production' && (isMockOrder || demo === true);

  if (!allowDemo) {
    if (!razorpay_payment_id || !razorpay_signature) {
      return apiRes.badRequest('razorpay_payment_id and razorpay_signature are required.');
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('[verify] RAZORPAY_KEY_SECRET is not set');
      return apiRes.serverError('Payment verification is not configured.');
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expected = hmac.digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    const sigBuf = Buffer.from(razorpay_signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    const valid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

    if (!valid) return apiRes.badRequest('Payment signature is invalid.');
  }

  const tx = await prisma.transaction.findUnique({ where: { razorpayOrderId: razorpay_order_id } });
  if (!tx) return apiRes.notFound('Transaction not found.');

  // Idempotency: if already paid, return success without double-counting
  if (tx.status === 'paid') {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  const paymentId = razorpay_payment_id ?? `demo_${Date.now()}`;
  await prisma.transaction.update({
    where: { id: tx.id },
    data: { razorpayPaymentId: paymentId, status: 'paid' },
  });

  // Sanitise supporter inputs
  const safeName = validateStr(supporterName ?? '', 0, 100) || 'A friend';
  const safeMessage = validateStr(message ?? '', 0, 500) || null;
  const safeCups = typeof cups === 'number' && cups > 0 && cups <= 10 ? Math.floor(cups) : 1;

  await prisma.support.create({
    data: {
      creatorId: tx.creatorId,
      supporterName: safeName,
      message: safeMessage,
      amount: tx.amount,
      cups: safeCups,
    },
  });

  const updatedCreator = await prisma.creator.update({
    where: { id: tx.creatorId },
    data: { totalSupporters: { increment: 1 }, totalEarned: { increment: tx.amount } },
    include: { user: true },
  });

  try {
    await sendCreatorEmailNotification({
      recipientEmail: updatedCreator.user?.email,
      creatorName: updatedCreator.name,
      supporterName: safeName,
      amount: tx.amount,
      cups: safeCups,
      message: safeMessage,
      creatorUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ekcup.in'}/${updatedCreator.username}`,
    });
  } catch (err) {
    console.error('[verify] Email notification failed:', err);
  }

  return NextResponse.json({ ok: true });
}
