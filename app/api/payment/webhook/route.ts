/**
 * POST /api/payment/webhook
 *
 * Razorpay webhook endpoint for async payment confirmation.
 * This handles cases where the browser closed before /api/payment/verify ran.
 *
 * Setup in Razorpay dashboard:
 *   URL: https://yourdomain.com/api/payment/webhook
 *   Events: payment.captured, payment.failed
 *   Set RAZORPAY_WEBHOOK_SECRET in your env.
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendCreatorEmailNotification } from '@/lib/notifications';
import { checkRateLimit, getClientIp, apiRes } from '@/lib/api-helpers';
import { creatorNetAmountAsync } from '@/lib/platform-config';

// Razorpay sends webhook payloads — we must read the raw body for HMAC verification
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`webhook:${ip}`, 60, 60_000)) return apiRes.rateLimited();

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    // SECURITY: Never accept unverified webhooks — a missing secret means
    // any attacker could POST fake payment.captured events to credit creators.
    // Return 500 so Razorpay retries once the secret is properly configured.
    console.error('[webhook] RAZORPAY_WEBHOOK_SECRET is not configured — rejecting all webhooks.');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';

  // Verify the HMAC signature using timing-safe comparison
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(rawBody);
  const expected = hmac.digest('hex');

  try {
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.warn('[webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid signature format' }, { status: 400 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const eventType = event.event as string | undefined;

  if (eventType === 'payment.captured') {
    await handlePaymentCaptured(event);
  } else if (eventType === 'payment.failed') {
    await handlePaymentFailed(event);
  }
  // Unknown events are silently acknowledged (Razorpay may add new event types)

  return NextResponse.json({ ok: true });
}

async function handlePaymentCaptured(event: Record<string, unknown>) {
  try {
    const payload = (event.payload as Record<string, unknown> | undefined);
    const payment = (payload?.payment as Record<string, unknown> | undefined)?.entity as Record<string, unknown> | undefined;

    if (!payment) return;

    const orderId = payment.order_id as string | undefined;
    const paymentId = payment.id as string | undefined;

    if (!orderId || !paymentId) return;

    const tx = await prisma.transaction.findUnique({ where: { razorpayOrderId: orderId } });
    if (!tx) {
      console.warn('[webhook] Transaction not found for orderId:', orderId);
      return;
    }

    // Idempotency check — don't double-count
    if (tx.status === 'paid') return;

    await prisma.transaction.update({
      where: { id: tx.id },
      data: { razorpayPaymentId: paymentId, status: 'paid' },
    });

    // Platform fee — percentage set in admin panel, cached 60s
    const netAmount = await creatorNetAmountAsync(tx.amount);

    // Create support record (webhook doesn't have supporter name/message — use defaults)
    await prisma.support.create({
      data: {
        creatorId: tx.creatorId,
        supporterName: 'A supporter',
        message: null,
        amount: netAmount,
        cups: 1,
      },
    });

    const updatedCreator = await prisma.creator.update({
      where: { id: tx.creatorId },
      data: { totalSupporters: { increment: 1 }, totalEarned: { increment: netAmount } },
      include: { user: true },
    });

    await sendCreatorEmailNotification({
      recipientEmail: updatedCreator.user?.email,
      creatorName: updatedCreator.name,
      supporterName: 'A supporter',
      amount: tx.amount,
      cups: 1,
      message: null,
      creatorUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ekcup.in'}/${updatedCreator.username}`,
    }).catch((err) => console.error('[webhook] Email failed:', err));
  } catch (err) {
    console.error('[webhook] handlePaymentCaptured error:', err);
  }
}

async function handlePaymentFailed(event: Record<string, unknown>) {
  try {
    const payload = (event.payload as Record<string, unknown> | undefined);
    const payment = (payload?.payment as Record<string, unknown> | undefined)?.entity as Record<string, unknown> | undefined;
    const orderId = payment?.order_id as string | undefined;
    if (!orderId) return;

    await prisma.transaction.updateMany({
      where: { razorpayOrderId: orderId, status: 'pending' },
      data: { status: 'failed' },
    });
  } catch (err) {
    console.error('[webhook] handlePaymentFailed error:', err);
  }
}
