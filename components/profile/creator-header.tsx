import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Youtube, X } from 'lucide-react';
import type { CreatorSummary } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export function CreatorHeader({ creator }: { creator: CreatorSummary }) {
  const initials = creator.name
    .split(' ')
    .map((part) => part[0])
    .join('');

  return (
    <section className="rounded-[2rem] border border-brand-200/70 bg-white/90 p-6 shadow-sm backdrop-blur dark:bg-card/80 sm:p-8">
      <div className="flex items-start gap-5">
        <div className="relative flex h-20 w-20 shrink-0 overflow-hidden rounded-full border border-brand-200 bg-brand-100 text-2xl font-semibold text-brand-700 ring-4 ring-brand-50">
          {creator.avatarUrl ? (
            <Image src={creator.avatarUrl} alt={creator.name} fill className="object-cover" sizes="80px" priority />
          ) : (
            <div className="flex h-full w-full items-center justify-center">{initials}</div>
          )}
        </div>

        <div className="min-w-0 space-y-4">
          <div className="space-y-1">
            <div className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
              Creator profile
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{creator.name}</h1>
            <p className="text-sm text-muted-foreground">ekcup.in/{creator.username}</p>
          </div>

          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{creator.bio}</p>

          <div className="flex flex-wrap gap-2">
            {creator.category.map((tag) => (
              <Badge key={tag} className="rounded-full border-brand-200/70 bg-brand-50/80 px-3 py-1 text-brand-700 shadow-sm">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-1 text-muted-foreground">
            {creator.socialLinks.instagram ? (
              <Link href={creator.socialLinks.instagram} aria-label="Instagram" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700">
                <Instagram className="h-4 w-4" />
              </Link>
            ) : null}
            {creator.socialLinks.youtube ? (
              <Link href={creator.socialLinks.youtube} aria-label="YouTube" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700">
                <Youtube className="h-4 w-4" />
              </Link>
            ) : null}
            {creator.socialLinks.twitter ? (
              <Link href={creator.socialLinks.twitter} aria-label="X" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700">
                <X className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
