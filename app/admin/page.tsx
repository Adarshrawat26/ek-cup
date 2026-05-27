import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatRupees } from '@/lib/utils';
import Link from 'next/link';
import { ArrowUpRight, Users, CreditCard, TrendingUp, Banknote } from 'lucide-react';

export const revalidate = 60;

export default async function AdminOverview() {
  const admin = await requireAdmin();
  if (!admin) redirect('/');

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalCreators,
    thisMonthCreators,
    lastMonthCreators,
    totalSupporters,
    thisMonthSupporters,
    paidTxAll,
    paidTxThisMonth,
    paidTxLastMonth,
    recentCreators,
    feeConfig,
    // Revenue by day for last 14 days (sparkline)
    last14DaysTx,
  ] = await Promise.all([
    prisma.creator.count(),
    prisma.creator.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.creator.count({ where: { createdAt: { gte: lastMonthStart, lt: monthStart } } }),
    prisma.support.count(),
    prisma.support.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.transaction.findMany({ where: { status: 'paid' }, select: { amount: true } }),
    prisma.transaction.findMany({ where: { status: 'paid', createdAt: { gte: monthStart } }, select: { amount: true } }),
    prisma.transaction.findMany({ where: { status: 'paid', createdAt: { gte: lastMonthStart, lt: monthStart } }, select: { amount: true } }),
    prisma.creator.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, username: true, totalEarned: true, totalSupporters: true, createdAt: true },
    }),
    prisma.platformConfig.findUnique({ where: { key: 'platform_fee_percent' } }),
    prisma.transaction.findMany({
      where: { status: 'paid', createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const grossAll = paidTxAll.reduce((s, t) => s + t.amount, 0);
  const grossThisMonth = paidTxThisMonth.reduce((s, t) => s + t.amount, 0);
  const grossLastMonth = paidTxLastMonth.reduce((s, t) => s + t.amount, 0);
  const feePercent = parseInt(feeConfig?.value ?? '0', 10);
  const platformEarnings = Math.floor(grossAll * (feePercent / 100));

  // Build sparkline data: bucket by day for last 14 days
  const dayBuckets: number[] = Array(14).fill(0);
  last14DaysTx.forEach((tx) => {
    const daysAgo = Math.floor((Date.now() - new Date(tx.createdAt).getTime()) / 86_400_000);
    const idx = 13 - Math.min(daysAgo, 13);
    dayBuckets[idx] += tx.amount;
  });
  const maxBucket = Math.max(...dayBuckets, 1);

  function pct(now: number, prev: number) {
    if (prev === 0) return now > 0 ? '+100%' : '—';
    const d = ((now - prev) / prev) * 100;
    return `${d >= 0 ? '+' : ''}${d.toFixed(0)}%`;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          href="/admin/settings"
          className="flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
        >
          Fee: {feePercent}% <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Creators"
          value={totalCreators.toLocaleString('en-IN')}
          trend={pct(thisMonthCreators, lastMonthCreators)}
          sub="vs last month"
          icon={<Users className="h-4 w-4" />}
          positive={thisMonthCreators >= lastMonthCreators}
        />
        <KpiCard
          label="Total Supporters"
          value={totalSupporters.toLocaleString('en-IN')}
          trend={pct(thisMonthSupporters, 0)}
          sub="this month"
          icon={<TrendingUp className="h-4 w-4" />}
          positive
        />
        <KpiCard
          label="Gross Revenue"
          value={formatRupees(grossThisMonth)}
          trend={pct(grossThisMonth, grossLastMonth)}
          sub="vs last month"
          icon={<CreditCard className="h-4 w-4" />}
          positive={grossThisMonth >= grossLastMonth}
        />
        <KpiCard
          label="Platform Earnings"
          value={formatRupees(platformEarnings)}
          trend={`${feePercent}% fee`}
          sub="all time"
          icon={<Banknote className="h-4 w-4" />}
          positive
        />
      </div>

      {/* Revenue sparkline + recent creators */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">

        {/* Sparkline */}
        <div className="rounded-[2rem] border border-brand-200/60 bg-white p-6 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Revenue</p>
              <h2 className="mt-1 text-lg font-semibold">Last 14 days</h2>
            </div>
            <span className="text-2xl font-semibold tracking-tight">{formatRupees(grossAll)}</span>
          </div>
          <div className="mt-6 flex h-24 items-end gap-1">
            {dayBuckets.map((v, i) => (
              <div key={i} className="group relative flex-1">
                <div
                  className="w-full rounded-t-md bg-brand-200 transition-all group-hover:bg-brand-500"
                  style={{ height: `${Math.max(4, (v / maxBucket) * 100)}%` }}
                />
                <div className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-lg bg-gray-900 px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap">
                  {formatRupees(v)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>14 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Recent creators */}
        <div className="rounded-[2rem] border border-brand-200/60 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Creators</p>
              <h2 className="mt-1 text-lg font-semibold">Recently joined</h2>
            </div>
            <Link href="/admin/creators" className="text-xs font-medium text-brand-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentCreators.length ? recentCreators.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">@{c.username}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-brand-700">{formatRupees(c.totalEarned)}</p>
                  <p className="text-xs text-muted-foreground">{c.totalSupporters} supporters</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No creators yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, trend, sub, icon, positive }: {
  label: string; value: string; trend: string; sub: string; icon: React.ReactNode; positive?: boolean;
}) {
  return (
    <div className="rounded-[2rem] border border-brand-200/60 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">{label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-500">{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className={`text-xs font-semibold ${positive ? 'text-green-600' : 'text-red-500'}`}>{trend}</span>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}
