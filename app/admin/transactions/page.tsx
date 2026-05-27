import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatRupees } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

const PAGE_SIZE = 25;

type Status = 'all' | 'paid' | 'pending' | 'failed';

type Props = {
  searchParams?: {
    status?: string;
    cursor?: string;
    q?: string;
  };
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  paid:    { label: 'Paid',    className: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  failed:  { label: 'Failed',  className: 'bg-red-100 text-red-600' },
};

export default async function AdminTransactions({ searchParams }: Props) {
  const admin = await requireAdmin();
  if (!admin) redirect('/');

  const rawStatus = searchParams?.status ?? 'all';
  const status: Status = ['paid', 'pending', 'failed'].includes(rawStatus)
    ? (rawStatus as Status)
    : 'all';
  const cursor = searchParams?.cursor;
  const q = searchParams?.q?.trim() ?? '';

  const where = {
    ...(status !== 'all' ? { status } : {}),
    ...(q
      ? {
          creator: {
            OR: [
              { name: { contains: q, mode: 'insensitive' as const } },
              { username: { contains: q, mode: 'insensitive' as const } },
            ],
          },
        }
      : {}),
  };

  const [transactions, totalCount] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        creator: { select: { name: true, username: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  const hasMore = transactions.length > PAGE_SIZE;
  const page = transactions.slice(0, PAGE_SIZE);
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  // Aggregate totals for filtered view
  const agg = await prisma.transaction.aggregate({
    where: { ...where, status: 'paid' },
    _sum: { amount: true },
    _count: true,
  });
  const grossFiltered = agg._sum.amount ?? 0;

  const statusParam = (s: string) => {
    const params = new URLSearchParams();
    if (s !== 'all') params.set('status', s);
    if (q) params.set('q', q);
    return `/admin/transactions?${params.toString()}`;
  };

  const buildHref = (opts: { cursor?: string }) => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (q) params.set('q', q);
    if (opts.cursor) params.set('cursor', opts.cursor);
    return `/admin/transactions?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount.toLocaleString('en-IN')} total
            {status !== 'all' && ` · ${status}`}
          </p>
        </div>
        {agg._count > 0 && (
          <div className="rounded-[1.25rem] border border-brand-200/60 bg-white px-5 py-3 text-right shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
              {status === 'all' ? 'Paid revenue' : 'Paid in view'}
            </p>
            <p className="mt-0.5 text-lg font-semibold">{formatRupees(grossFiltered)}</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status tabs */}
        <div className="flex rounded-2xl border border-brand-200 bg-white p-1 gap-0.5">
          {(['all', 'paid', 'pending', 'failed'] as const).map((s) => (
            <Link
              key={s}
              href={statusParam(s)}
              className={`rounded-xl px-4 py-1.5 text-xs font-semibold capitalize transition ${
                status === s
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        {/* Creator search */}
        <form method="GET" className="flex gap-2 ml-auto">
          {status !== 'all' && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search creator…"
            className="rounded-2xl border border-brand-200 bg-white px-4 py-2 text-sm outline-none ring-brand-500 transition placeholder:text-muted-foreground focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-2xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Search
          </button>
          {q && (
            <Link
              href={statusParam(status)}
              className="rounded-2xl border border-brand-200 px-4 py-2 text-sm text-muted-foreground transition hover:bg-gray-50"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="rounded-[2rem] border border-brand-200/60 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100">
            <tr className="text-left">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Creator</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Amount</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Status</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Order ID</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Date</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {page.map((tx) => {
              const s = STATUS_LABELS[tx.status] ?? { label: tx.status, className: 'bg-gray-100 text-gray-600' };
              return (
                <tr key={tx.id} className="hover:bg-brand-50/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                        {tx.creator.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{tx.creator.name}</p>
                        <p className="text-xs text-muted-foreground">@{tx.creator.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-brand-700">{formatRupees(tx.amount)}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.className}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-xs text-muted-foreground">
                      {tx.razorpayOrderId.slice(0, 18)}…
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                    <br />
                    <span className="text-[10px]">
                      {new Date(tx.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <a
                      href={`/${tx.creator.username}`}
                      target="_blank"
                      className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              );
            })}
            {page.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  {q
                    ? `No transactions for "${q}"`
                    : status !== 'all'
                    ? `No ${status} transactions`
                    : 'No transactions yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {(cursor || hasMore) && (
          <div className="flex items-center justify-between border-t border-brand-100 px-6 py-4">
            <p className="text-xs text-muted-foreground">
              Showing {page.length} of {totalCount.toLocaleString('en-IN')}
            </p>
            <div className="flex gap-2">
              {cursor && (
                <Link
                  href={buildHref({})}
                  className="flex items-center gap-1.5 rounded-xl border border-brand-200 px-3 py-1.5 text-xs font-medium transition hover:bg-brand-50"
                >
                  <ArrowLeft className="h-3 w-3" /> First
                </Link>
              )}
              {nextCursor && (
                <Link
                  href={buildHref({ cursor: nextCursor })}
                  className="flex items-center gap-1.5 rounded-xl border border-brand-200 px-3 py-1.5 text-xs font-medium transition hover:bg-brand-50"
                >
                  Next <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
