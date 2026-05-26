"use client";

import type { CreatorSummary } from '@/lib/types';
import { parsePerks } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function MembershipTiers({ creator }: { creator: CreatorSummary }) {
  return (
    <div className="rounded-[2rem] border border-brand-200/70 bg-white/90 p-6 shadow-sm backdrop-blur dark:bg-card/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Support options</p>
          <h2 className="mt-2 text-lg font-semibold">Membership tiers</h2>
          <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">Pick a level that feels right and unlock support that feels personal, not corporate.</p>
        </div>
        <div className="inline-flex min-w-[7rem] items-center justify-center rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-center text-sm font-medium leading-none text-brand-700 shadow-sm whitespace-nowrap">
          {creator.memberships.length} support plans
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {creator.memberships.map((tier, index) => {
          const isFeatured = index === 1 || (index === 0 && creator.memberships.length === 1);
          const perks = parsePerks(tier.perks);

          return (
            <div
              key={tier.name}
              className={`rounded-[1.5rem] border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] ${
                isFeatured
                  ? 'border-brand-300 bg-gradient-to-br from-brand-50/80 via-white to-brand-100/40 ring-1 ring-brand-200/60'
                  : 'border-border/70 bg-gradient-to-br from-white to-brand-50/30'
              }`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-base font-semibold">{tier.name}</div>
                    {isFeatured ? (
                      <span className="rounded-full border border-brand-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                        Most loved
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-sm font-medium text-brand-700">{tier.price}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-brand-200 bg-white px-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50"
                  onClick={() => {
                    document.getElementById('support')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  Join
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {perks.map((perk) => (
                  <div key={perk} className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white px-3 py-1.5 text-sm text-muted-foreground shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
