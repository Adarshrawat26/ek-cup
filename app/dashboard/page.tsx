import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowUpRight, Banknote, Heart, MessageSquareText, Sparkles } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatRupees } from '@/lib/utils';
import { getPlatformFeePercent } from '@/lib/platform-config';
import { Button } from '@/components/ui/button';
import { MembershipForm } from '@/components/dashboard/membership-form';
import { PostForm } from '@/components/dashboard/post-form';
import { ShopItemForm } from '@/components/dashboard/shop-item-form';

type DashboardProps = {
  searchParams?: Promise<{ username?: string }>;
};

const creatorInclude = {
  user: true,
  payout: true,
  supports: { orderBy: { createdAt: 'desc' as const }, take: 20 },
  memberships: { orderBy: { createdAt: 'desc' as const } },
  posts: { orderBy: { createdAt: 'desc' as const } },
  shopItems: { orderBy: { createdAt: 'desc' as const } },
  transactions: { orderBy: { createdAt: 'desc' as const }, take: 10 },
};

export default async function DashboardPage({ searchParams }: DashboardProps) {
  const session = await getSession();
  const isDev = process.env.NODE_ENV !== 'production';

  // ── Auth gate ────────────────────────────────────────────────────────────
  // Production: must be signed in.
  // Dev/demo: allow without a session (fall back to a creator for local testing).
  if (!session?.user?.id && !isDev) {
    redirect('/');
  }

  const sp = await searchParams;
  const username = sp?.username?.toLowerCase();

  // ── Creator resolution ───────────────────────────────────────────────────
  // Priority:
  //  1. Authenticated user  → their own creator (ignore ?username param for security)
  //  2. Dev + ?username param → creator by username (demo / admin inspection)
  //  3. Dev + no params      → most recent creator (local testing fallback)
  let creator;

  if (session?.user?.id) {
    creator = await prisma.creator.findFirst({
      where: { userId: session.user.id },
      include: creatorInclude,
    });

    // Authenticated but has no creator page yet → send to onboarding
    if (!creator) {
      redirect('/onboarding/profile');
    }
  } else if (isDev && username) {
    creator = await prisma.creator.findUnique({
      where: { username },
      include: creatorInclude,
    });
  } else if (isDev) {
    creator = await prisma.creator.findFirst({
      orderBy: { createdAt: 'desc' },
      include: creatorInclude,
    });
  }

  if (!creator) notFound();

  // ── Stats ────────────────────────────────────────────────────────────────
  const [feePercent, monthStart] = [await getPlatformFeePercent(), new Date()];
  monthStart.setHours(0, 0, 0, 0);
  monthStart.setDate(1);

  const monthSupports = creator.supports.filter((s) => new Date(s.createdAt) >= monthStart);
  const monthEarned = monthSupports.reduce((t, s) => t + s.amount, 0);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 rounded-[2rem] border border-brand-200/70 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-700">Creator dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{creator.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">ekcup.in/{creator.username}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-full bg-brand-500 text-white hover:bg-brand-600" asChild>
              <Link href={`/${creator.username}`} target="_blank">
                View public page <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/">Home</Link>
            </Button>
            {session ? (
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/api/auth/signout">Sign out</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Banknote className="h-5 w-5" />} label="This month" value={formatRupees(monthEarned)} subtext={`${monthSupports.length} payments${feePercent > 0 ? ` · after ${feePercent}% fee` : ''}`} />
        <StatCard icon={<Heart className="h-5 w-5" />} label="Lifetime earned" value={formatRupees(creator.totalEarned)} subtext={`${creator.totalSupporters} supporters${feePercent > 0 ? ` · after ${feePercent}% fee` : ''}`} />
        <StatCard icon={<Sparkles className="h-5 w-5" />} label="Memberships" value={String(creator.memberships.length)} subtext="Active tiers" />
        <StatCard icon={<MessageSquareText className="h-5 w-5" />} label="Posts & shop" value={String(creator.posts.length + creator.shopItems.length)} subtext="Published items" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">

          {/* Memberships */}
          <section className="rounded-[2rem] border border-brand-200/70 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Memberships</p>
                <h2 className="mt-1 text-xl font-semibold">Support tiers</h2>
              </div>
              <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                {creator.memberships.length} active
              </span>
            </div>
            <MembershipForm creatorId={creator.id} memberships={creator.memberships} />
          </section>

          {/* Posts */}
          <section className="rounded-[2rem] border border-brand-200/70 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Posts</p>
                <h2 className="mt-1 text-xl font-semibold">Publish an update</h2>
              </div>
              <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                {creator.posts.length} total
              </span>
            </div>
            <PostForm creatorId={creator.id} posts={creator.posts} />
          </section>

          {/* Shop */}
          <section className="rounded-[2rem] border border-brand-200/70 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Shop</p>
                <h2 className="mt-1 text-xl font-semibold">Digital products & services</h2>
              </div>
              <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                {creator.shopItems.length} items
              </span>
            </div>
            <ShopItemForm creatorId={creator.id} shopItems={creator.shopItems} />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">

          {/* Payout */}
          <section className="rounded-[2rem] border border-brand-200/70 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Payout</p>
            <h2 className="mt-2 text-xl font-semibold">Bank and UPI</h2>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              {creator.payout ? (
                <>
                  <div><span className="font-medium text-foreground">UPI:</span> {creator.payout.upiId || '—'}</div>
                  <div><span className="font-medium text-foreground">Bank:</span> {creator.payout.bankName || '—'}</div>
                  <div><span className="font-medium text-foreground">Holder:</span> {creator.payout.accountHolder || '—'}</div>
                </>
              ) : (
                <p>No payout details yet.</p>
              )}
            </div>
          </section>

          {/* Transactions */}
          <section className="rounded-[2rem] border border-brand-200/70 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Transactions</p>
            <h2 className="mt-2 text-xl font-semibold">Recent payments</h2>
            <div className="mt-4 space-y-2">
              {creator.transactions.length ? (
                creator.transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-brand-50/20 px-3 py-2 text-sm">
                    <span className="max-w-[110px] truncate font-mono text-xs text-muted-foreground">{tx.razorpayOrderId}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tx.status === 'paid' ? 'bg-green-50 text-green-700' : tx.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                      {tx.status}
                    </span>
                    <span className="font-medium text-brand-700">{formatRupees(tx.amount)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No transactions yet.</p>
              )}
            </div>
          </section>

          {/* Recent supporters */}
          <section className="rounded-[2rem] border border-brand-200/70 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Recent supporters</p>
            <h2 className="mt-2 text-xl font-semibold">Latest activity</h2>
            <div className="mt-4 space-y-3">
              {creator.supports.length ? (
                creator.supports.map((support) => (
                  <div key={support.id} className="rounded-[1.25rem] border border-border/70 bg-brand-50/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{support.supporterName ?? 'A friend'}</div>
                      <div className="text-sm font-medium text-brand-700">{formatRupees(support.amount)}</div>
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {support.cups} cup{support.cups > 1 ? 's' : ''} · {new Date(support.createdAt).toLocaleString('en-IN')}
                    </div>
                    {support.message ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{support.message}</p> : null}
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-brand-200 bg-brand-50/20 p-6 text-sm text-muted-foreground">
                  No supporters yet. Share your page to start collecting cups.
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value, subtext }: { icon?: React.ReactNode; label: string; value: string; subtext: string }) {
  return (
    <div role="group" className="relative rounded-lg border border-brand-200/60 bg-white p-4 shadow-sm">
      <div className="absolute right-3 top-3 text-[11px] font-medium uppercase tracking-[0.26em] text-brand-700">{label}</div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{subtext}</div>
    </div>
  );
}
