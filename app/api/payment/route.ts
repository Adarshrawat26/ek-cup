import { NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as null | {
    amount?: number;
    creatorUsername?: string;
    message?: string;
  };

  const amount = body?.amount ?? 29;

  if (!Number.isFinite(amount) || amount < 1) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const order = await createRazorpayOrder(Math.round(amount), `ekcup_${body?.creatorUsername ?? 'support'}_${Date.now()}`);

  return NextResponse.json({
    order,
    keyId: process.env.RAZORPAY_KEY_ID ?? 'rzp_test_placeholder',
    mock: !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET,
    message: body?.message ?? ''
  });
}