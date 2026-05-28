import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatRupees } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

const PAGE_SIZE = 20;

type Props = { searchParams?: Promise<{ q?: string; cursor?: string; dir?: 'next' | 'prev' }> };

export default async function AdminCreators({ searchParams }: Props) {
  const admin = await requireAdmin();
  if (!admin) redirect('/');

  const sp = await searchParams;
  const q = sp?.q?.trim() ?? '';
  const cursor = sp?.cursor;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { username: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {};

  // Fetch PAGE_SIZE + 1 to detect if there's a next page
  const creators = await prisma.creator.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true, name: true, username: true, totalEarned: true,
      totalSupporters: true, createdAt: true, onboardingComplete: true,
      _count: { select: { memberships: true, posts: true } },
    },
  });

  const hasMore = creators.length > PAGE_SIZE;
  const page = creators.slice(0, PAGE_SIZE);
  const nextCursor = hasMore ? page[page.length - 1].id : null;
  const totalCount = await prisma.creator.count({ where });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Creators</h1>
          <p className="mt-1 text-sm text-muted-foreground">{totalCount.toLocaleString('en-IN')} total</p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or username…"
          className="flex-1 rounded-2xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-500 transition placeholder:text-muted-foreground focus:ring-2"
        />
        <button
          type="submit"
          className="rounded-2xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          Search
        </button>
        {q && (
          <Link href="/admin/creators" className="rounded-2xl border border-brand-200 px-4 py-2.5 text-sm text-muted-foreground transition hover:bg-gray-50">
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="rounded-[2rem] border border-brand-200/60 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100">
            <tr className="text-left">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Creator</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Earned</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Supporters</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Content</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Status</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Joined</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {page.map((c) => (
              <tr key={c.id} className="hover:bg-brand-50/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">@{c.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 font-semibold text-brand-700">{formatRupees(c.totalEarned)}</td>
                <td className="px-4 py-4 text-muted-foreground">{c.totalSupporters}</td>
                <td className="px-4 py-4 text-muted-foreground text-xs">
                  {c._count.posts} posts · {c._count.memberships} tiers
                </td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    c.onboardingComplete
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {c.onboardingComplete ? 'Active' : 'Onboarding'}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-4">
                  <a
                    href={`/${c.username}`}
                    target="_blank"
                    className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
              </tr>
            ))}
            {page.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  {q ? `No creators matching "${q}"` : 'No creators yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {(cursor || hasMore) && (
          <div className="flex items-center justify-between border-t border-brand-100 px-6 py-4">
            <p className="text-xs text-muted-foreground">Showing {page.length} of {totalCount}</p>
            <div className="flex gap-2">
              {cursor && (
                <Link
                  href={`/admin/creators?${q ? `q=${encodeURIComponent(q)}&` : ''}`}
                  className="flex items-center gap-1.5 rounded-xl border border-brand-200 px-3 py-1.5 text-xs font-medium transition hover:bg-brand-50"
                >
                  <ArrowLeft className="h-3 w-3" /> First
                </Link>
              )}
              {nextCursor && (
                <Link
                  href={`/admin/creators?${q ? `q=${encodeURIComponent(q)}&` : ''}cursor=${nextCursor}`}
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
