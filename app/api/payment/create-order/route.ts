import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { $Enums } from '@prisma/client';
import { razorpay } from '@/lib/razorpay';
import { checkRateLimit, getClientIp, validateNum, apiRes } from '@/lib/api-helpers';

// Rupee bounds: min ₹1, max ₹5,000 per single chai support
const MIN_AMOUNT_RS = 1;
const MAX_AMOUNT_RS = 5_000;

type CreateOrderBody = {
  amount: number;
  creatorUsername: string;
  message?: string;
  supporterName?: string;
  cups?: number;
};

type OrderLike = { id: string; amount: number; currency: string };

export async function POST(req: Request) {
  // Rate limit: 15 orders per minute per IP (prevents order flooding)
  const ip = getClientIp(req);
  if (!await checkRateLimit(`create-order:${ip}`, 15, 60_000)) return apiRes.rateLimited();

  const body = await req.json().catch(() => ({})) as CreateOrderBody;
  const { amount, creatorUsername } = body;

  // Validate amount
  const validAmount = validateNum(amount, MIN_AMOUNT_RS, MAX_AMOUNT_RS);
  if (validAmount === null) {
    return apiRes.badRequest(`Amount must be between ₹${MIN_AMOUNT_RS} and ₹${MAX_AMOUNT_RS}.`);
  }

  if (!creatorUsername || typeof creatorUsername !== 'string') {
    return apiRes.badRequest('creatorUsername is required.');
  }

  const creator = await prisma.creator.findUnique({
    where: { username: creatorUsername.toLowerCase().trim() },
  });
  if (!creator) return apiRes.notFound('Creator not found.');

  const amountPaise = Math.round(validAmount * 100);

  try {
    let order: OrderLike;

    if (razorpay) {
      const created = await razorpay.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
      });
      order = { id: created.id, amount: created.amount as number, currency: created.currency };
    } else {
      order = { id: `mock_${Date.now()}`, amount: amountPaise, currency: 'INR' };
    }

    await prisma.transaction.create({
      data: { creatorId: creator.id, razorpayOrderId: order.id, amount: amountPaise, status: $Enums.TransactionStatus.pending },
    });

    return NextResponse.json({
      order,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
      creatorName: creator.name,
    });
  } catch (err) {
    console.error('[create-order]', err);
    return apiRes.serverError('Unable to create order. Please try again.');
  }
}
