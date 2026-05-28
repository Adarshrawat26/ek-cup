import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [
    totalCreators,
    totalSupporters,
    totalTransactions,
    // H-3: aggregate avoids loading every paid transaction row into memory
    paidAggregate,
    recentCreators,
    recentTransactions,
    feeConfig,
  ] = await Promise.all([
    prisma.creator.count(),
    prisma.support.count(),
    prisma.transaction.count(),
    prisma.transaction.aggregate({
      where: { status: 'paid' },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.creator.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true, name: true, username: true, totalEarned: true,
        totalSupporters: true, createdAt: true, onboardingComplete: true,
      },
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true, razorpayOrderId: true, amount: true, status: true, createdAt: true,
        creator: { select: { name: true, username: true } },
      },
    }),
    prisma.platformConfig.findUnique({ where: { key: 'platform_fee_percent' } }),
  ]);

  const grossRevenue = paidAggregate._sum.amount ?? 0;
  const feePercent = parseInt(feeConfig?.value ?? '0', 10);
  const platformEarnings = Math.floor(grossRevenue * (feePercent / 100));

  return NextResponse.json({
    totalCreators,
    totalSupporters,
    totalTransactions,
    grossRevenue,
    platformEarnings,
    feePercent,
    recentCreators,
    recentTransactions,
  });
}
