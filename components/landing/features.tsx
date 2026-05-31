'use client';

import { useState } from 'react';
import { features } from '@/lib/mock-data';

type Persona = 'Illustrator' | 'Educator' | 'YouTuber' | 'Writer';

const PERSONAS: Persona[] = ['Illustrator', 'Educator', 'YouTuber', 'Writer'];

// Persona-specific descriptions — titles stay the same, copy swaps on tab change.
// Order matches mock-data features array:
// [0] One-tap support  [1] Memberships  [2] Creator shop
// [3] Email to fans    [4] UPI payouts  [5] You own your fans
const PERSONA_DESCRIPTIONS: Record<Persona, string[]> = {
  Illustrator: [
    'Fans send chai for your art in seconds with UPI, cards, or wallets. No PayPal, no invoicing.',
    'Offer exclusive brush packs, early WIPs, and behind-the-scenes sketches to monthly members.',
    'Sell prints, Procreate brushes, reference packs, and ebook guides — all in one storefront.',
    'Send weekly process breakdowns and art drops to your collectors. Free, with your branding.',
    'Get paid instantly to your UPI ID or bank after every commission or download purchase.',
    'Export your collector list any time. Migrate platforms? Your fans come with you.',
  ],
  Educator: [
    'Students send a cup to say thank you — no awkward Patreon link, just a simple UPI tap.',
    'Run tiered cohorts: free watchers, paid students, VIP mentees — all under one dashboard.',
    'Sell courses, notes, PDFs, recorded sessions, and cohort slots with zero extra commission.',
    'Send weekly lessons, quiz drops, and announcements free. Replace your Mailchimp subscription.',
    'Settle directly to your UPI ID. No 30-day wait, no dollar conversion, no wire fees.',
    'Own your student data. Run your next cohort off-platform? Export and go — no lock-in.',
  ],
  YouTuber: [
    'Fans send chai while watching — 3 seconds, UPI, done. More likely than a Super Chat.',
    'Give channel members early access, ad-free content, and Discord perks via tiered memberships.',
    'Sell watch-along tickets, merch drops, presets, and editing LUTs alongside your channel.',
    'Send newsletters to subscribers who actually want mail. No algorithm, just your inbox.',
    'Get paid to your UPI ID same day. No YouTube monetisation threshold drama.',
    'Your subscriber list is yours. If YouTube demonetises you, your Ek Cup fans still pay you.',
  ],
  Writer: [
    'Readers buy you a chai after a great essay — two taps, UPI done. No PayPal account required.',
    'Offer paid newsletters, subscriber-only posts, and manuscript beta reads via memberships.',
    "Sell ebooks, story collections, writing guides, and limited-edition PDFs in your shop.",
    "Send your newsletter free from Ek Cup. Ditch Substack's 10% cut on paid subscriptions.",
    'Earn settles to your UPI ID instantly — no publisher advances, no 90-day royalty cycles.',
    "Export your reader list whenever you want. Your audience is yours, not the platform's.",
  ],
};

export function Features() {
  const [persona, setPersona] = useState<Persona>('Illustrator');

  const descriptions = PERSONA_DESCRIPTIONS[persona];

  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">Features</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need to earn
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          One platform. Every tool a creator in India needs to get paid by fans.
        </p>
      </div>

      {/* Persona pill selector */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">I&apos;m a →</span>
        {PERSONAS.map((p) => (
          <button
            key={p}
            onClick={() => setPersona(p)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              persona === p
                ? 'bg-brand-500 text-white shadow-sm'
                : 'border border-border/70 bg-white text-foreground hover:border-brand-300 dark:bg-card'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Feature grid */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="rounded-[1.75rem] border border-border/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:bg-card"
          >
            <h3 className="text-lg font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {descriptions[index]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
