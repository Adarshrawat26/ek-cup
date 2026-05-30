import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { CreatorHeader } from '@/components/profile/creator-header';
import { SupporterFeed } from '@/components/profile/supporter-feed';
import { ChaiWidget } from '@/components/profile/chai-widget';
import { MembershipTiers } from '@/components/profile/membership-tiers';
import { prisma } from '@/lib/prisma';
import { parsePerks } from '@/lib/utils';
import { getPlatformFeePercent } from '@/lib/platform-config';
import type { CreatorSummary } from '@/lib/types';

type PageProps = {
  params: Promise<{ username: string }>;
};

// ─── Cached DB fetch ──────────────────────────────────────────────────────────
// Creator pages are public and read-heavy. Cache for 60 s so a popular page
// shared on social media doesn't hammer the DB.  The cache is invalidated via
// revalidateTag('creator:<username>') whenever the creator updates their profile.

const getCreatorCached = unstable_cache(
  async (username: string) =>
    prisma.creator.findUnique({
      where: { username },
      include: {
        supports: { orderBy: { createdAt: 'desc' }, take: 10 },
        memberships: true,
        posts: { orderBy: { createdAt: 'desc' }, take: 6 },
        shopItems: { orderBy: { createdAt: 'desc' }, take: 6 },
      },
    }),
  ['creator-page'],
  { revalidate: 60, tags: ['creator-page'] }
);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  // M-4: reuse the cached query instead of a separate uncached DB call
  const creatorDb = await getCreatorCached(username);
  if (!creatorDb) return { title: 'Not found' } as Metadata;

  const creator: Partial<CreatorSummary> = {
    username: creatorDb.username,
    name: creatorDb.name,
    handle: `ekcup.in/${creatorDb.username}`,
    bio: creatorDb.bio ?? '',
    avatarUrl: creatorDb.avatarUrl ?? undefined
  };

  return {
    title: `${creator.name} | Ek Cup`,
    description: creator.bio,
    openGraph: {
      title: `${creator.name} on Ek Cup`,
      description: creator.bio,
      images: creator.avatarUrl ? [{ url: creator.avatarUrl, width: 1200, height: 1200, alt: creator.name }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: `${creator.name} | Ek Cup`,
      description: creator.bio,
      images: creator.avatarUrl ? [creator.avatarUrl] : undefined
    }
  };
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { username } = await params;
  const [creatorDb, feePercent] = await Promise.all([
    getCreatorCached(username),
    getPlatformFeePercent(),
  ]);

  if (!creatorDb) return notFound();


  const creator: CreatorSummary = {
    username: creatorDb.username,
    name: creatorDb.name,
    handle: `ekcup.in/${creatorDb.username}`,
    bio: creatorDb.bio ?? '',
    avatarUrl: creatorDb.avatarUrl ?? undefined,
    category: typeof creatorDb.tags === 'string' && creatorDb.tags.length ? creatorDb.tags.split(',') : [],
    location: '',
    earnings: `₹${(creatorDb.totalEarned ?? 0) / 100}`,
    supportersCount: `${creatorDb.totalSupporters ?? 0} supporters`,
    socialLinks: {
      instagram: creatorDb.instagramUrl ?? undefined,
      youtube: creatorDb.youtubeUrl ?? undefined,
      twitter: creatorDb.twitterUrl ?? undefined
    },
    supporterFeed: creatorDb.supports.map((s) => ({ id: s.id, name: s.supporterName ?? 'A friend', message: s.message ?? '', time: new Date(s.createdAt).toISOString(), avatarInitials: (s.supporterName ?? 'A').charAt(0) })),
      memberships: creatorDb.memberships.map((m) => ({ name: m.name, price: `₹${(m.priceInPaise ?? 0) / 100}/mo`, perks: parsePerks(m.perks) })),
      posts: creatorDb.posts.map((post) => ({
        id: post.id,
        title: post.title,
        body: post.body,
        audience: post.audience,
        createdAt: new Date(post.createdAt).toISOString()
      })),
      shopItems: creatorDb.shopItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: `₹${(item.priceInPaise ?? 0) / 100}`,
        deliveryUrl: item.deliveryUrl ?? undefined
      }))
  };

  const supportTotal = creatorDb.totalSupporters ?? 0;
  const earnedTotal = (creatorDb.totalEarned ?? 0) / 100;
  const recentSupporters = creatorDb.supports.length;

  return (
    <main className="relative mx-auto min-h-screen max-w-7xl overflow-hidden px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(193,123,60,0.18),transparent_36%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_30%),linear-gradient(180deg,rgba(255,250,243,0.98),rgba(255,255,255,0))]" />
      <div className="absolute left-1/2 top-[-12rem] -z-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-brand-200/20 blur-3xl" />

      <section className="mb-6 rounded-[2rem] border border-brand-200/60 bg-white/85 p-5 shadow-sm backdrop-blur dark:bg-card/80 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-800">
              Support {creator.name.split(' ')[0]} directly
            </p>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">A warmer creator page, built for Bharat.</h1>
              <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">
                A cleaner space for supporters, memberships, and updates, with one-tap chai support right up front.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[16rem]">
            <div className="rounded-2xl border border-brand-200/70 bg-brand-50/80 p-4 text-center">
              <div className="text-2xl font-semibold text-brand-800">{supportTotal}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-brand-700/80">Supporters</div>
            </div>
            <div className="rounded-2xl border border-brand-200/70 bg-brand-50/80 p-4 text-center">
              <div className="text-2xl font-semibold text-brand-800">{recentSupporters}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-brand-700/80">Recent</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1.1fr)_380px] lg:items-start">
        <div className="space-y-6">
          <CreatorHeader creator={creator} />
          <SupporterFeed creator={creator} />
          <section className="rounded-[2rem] border border-brand-200/70 bg-white/90 p-6 shadow-sm backdrop-blur dark:bg-card/80">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Updates</p>
                <h2 className="mt-2 text-lg font-semibold">Recent posts</h2>
              </div>
              <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                {creator.posts?.length ?? 0}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {creator.posts?.length ? (
                creator.posts.map((post) => (
                  <article key={post.id} className="rounded-[1.5rem] border border-border/70 bg-gradient-to-br from-white to-brand-50/40 p-4">
                    <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-brand-700">
                      <span>{post.audience === 'members' ? 'Members only' : 'Public'}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold">{post.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{post.body}</p>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-brand-200 bg-brand-50/20 p-6 text-sm text-muted-foreground">
                  No creator posts yet.
                </div>
              )}
            </div>
          </section>
          <div className="lg:hidden">
            <ChaiWidget creator={creator} feePercent={feePercent} />
          </div>
        </div>

        <div className="space-y-5 lg:sticky lg:top-6">
          <ChaiWidget creator={creator} id="support" feePercent={feePercent} />
          <MembershipTiers creator={creator} />
          <section className="rounded-[2rem] border border-brand-200/70 bg-white/90 p-6 shadow-sm backdrop-blur dark:bg-card/80">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Shop</p>
                <h2 className="mt-2 text-lg font-semibold">Products and services</h2>
              </div>
              <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                {creator.shopItems?.length ?? 0}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {creator.shopItems?.length ? (
                creator.shopItems.map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] border border-border/70 bg-gradient-to-br from-white to-brand-50/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-brand-700">{item.price}</div>
                      </div>
                      {item.deliveryUrl ? (
                        <a href={item.deliveryUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-700 underline">
                          Open
                        </a>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-brand-200 bg-brand-50/20 p-6 text-sm text-muted-foreground">
                  No shop items yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}