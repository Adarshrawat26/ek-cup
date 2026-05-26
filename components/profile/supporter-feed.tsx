'use client';

import useSWR from 'swr';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { CreatorSummary } from '@/lib/types';

type SupportItem = {
  id: string;
  supporterName: string | null;
  message: string | null;
  amount: number;
  cups: number;
  createdAt: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function SupporterFeed({ creator }: { creator: CreatorSummary }) {
  const { data, error, mutate } = useSWR(`/api/creators/${creator.username}/supporters`, fetcher, { refreshInterval: 30000 });

  const loading = !data && !error;
  const supports: SupportItem[] = data?.supports ?? [];

  return (
    <div className="rounded-[2rem] border border-brand-200/70 bg-white/90 p-6 shadow-sm backdrop-blur dark:bg-card/80">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Recent supporters</h2>
          <p className="text-sm text-muted-foreground">Live support feed</p>
        </div>
        <div className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          {supports.length || creator.supporterFeed.length} updates
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <SupporterFeedSkeleton />
        ) : (
          supports.map((s) => (
            <div key={s.id} className="animate-in fade-in slide-in-from-top-2 flex items-start gap-3 rounded-2xl border border-border/70 bg-gradient-to-br from-white to-brand-50/40 p-4 shadow-[0_12px_32px_-28px_rgba(15,23,42,0.35)]">
              <Avatar className="h-10 w-10 ring-2 ring-white">
                <AvatarFallback>{(s.supporterName ?? 'A').charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{s.supporterName ?? 'A friend'} bought {s.cups} cup{s.cups > 1 ? 's' : ''}</p>
                  <span className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</span>
                </div>
                {s.message ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{s.message}</p> : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SupporterFeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-white/80 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}