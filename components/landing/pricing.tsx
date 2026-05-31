import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Plan = {
  name: string;
  price: string;
  priceNote: string;
  strikethrough?: string;
  countdown?: string;
  description: string;
  cta: string;
  ctaHref: string;
  featured: boolean;
  badge?: string;
  perks: string[];
};

const PLANS: Plan[] = [
  {
    name: 'Starter',
    price: 'Free',
    priceNote: 'forever',
    description: 'Perfect for creators just getting started.',
    cta: 'Start for free',
    ctaHref: '/signin',
    featured: false,
    perks: [
      'Public creator page',
      'One-tap chai support',
      'UPI & bank payouts',
      '5% platform fee',
      'Supporter feed',
    ],
  },
  {
    name: 'Pro',
    price: '₹0',
    priceNote: 'during early access',
    strikethrough: '₹499/mo',
    countdown: 'Free for 43 more days',
    description: 'Everything a serious creator needs, free while we grow.',
    cta: 'Get Pro free',
    ctaHref: '/signin',
    featured: true,
    badge: 'Most popular',
    perks: [
      'Everything in Starter',
      'Memberships & tiers',
      'Creator shop',
      'Email to fans',
      'Analytics dashboard',
      'Priority support',
    ],
  },
  {
    name: 'Brand / Agency',
    price: 'Custom',
    priceNote: 'negotiated',
    description: 'Managing multiple creators or a brand? Let\'s talk.',
    cta: 'Contact us',
    ctaHref: 'mailto:hello@ekcup.in',
    featured: false,
    perks: [
      'Multi-creator dashboard',
      'Custom domain',
      'Negotiated fees',
      'Dedicated account manager',
      'White-label options',
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">Pricing</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Fair pricing for Bharat
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Start free. No credit card. No hidden fees.
        </p>
      </div>

      {/* Cards */}
      <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-start">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-[1.5rem] border p-5 ${
              plan.featured
                ? 'border-brand-400 bg-brand-500 text-white shadow-[0_8px_40px_-8px_rgba(193,123,60,0.5)]'
                : 'border-border/70 bg-white shadow-sm dark:bg-card'
            }`}
          >
            {/* Badge */}
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-0.5 text-xs font-semibold text-brand-700 shadow-sm">
                {plan.badge}
              </span>
            )}

            {/* Plan name & description */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${plan.featured ? 'text-white/70' : 'text-brand-700'}`}>
                  {plan.name}
                </p>
                {/* Scarcity countdown badge */}
                {plan.countdown && (
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold" style={{ background: '#FAEEDA', color: '#854F0B' }}>
                    {plan.countdown}
                  </span>
                )}
              </div>
              {/* Strikethrough anchor price */}
              {plan.strikethrough && (
                <p className={`mt-2 text-xs line-through ${plan.featured ? 'text-white/50' : 'text-muted-foreground'}`}>
                  {plan.strikethrough}
                </p>
              )}
              <div className="mt-1 flex items-end gap-1.5">
                <span className={`text-3xl font-bold tracking-tight ${plan.featured ? 'text-white' : 'text-foreground'}`}>
                  {plan.price}
                </span>
                <span className={`mb-0.5 text-xs ${plan.featured ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {plan.priceNote}
                </span>
              </div>
              <p className={`mt-1.5 text-xs leading-5 ${plan.featured ? 'text-white/75' : 'text-muted-foreground'}`}>
                {plan.description}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-5">
              <Button
                className={`w-full rounded-full text-sm font-semibold ${
                  plan.featured
                    ? 'bg-white text-brand-700 hover:bg-brand-50'
                    : 'bg-brand-500 text-white hover:bg-brand-600'
                }`}
                asChild
              >
                <Link href={plan.ctaHref}>{plan.cta}</Link>
              </Button>
            </div>

            {/* Divider */}
            <div className={`my-5 border-t ${plan.featured ? 'border-white/20' : 'border-border/60'}`} />

            {/* Perks */}
            <ul className="space-y-2">
              {plan.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2.5">
                  <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                    plan.featured ? 'bg-white/20' : 'bg-brand-100'
                  }`}>
                    <Check className={`h-2.5 w-2.5 ${plan.featured ? 'text-white' : 'text-brand-600'}`} />
                  </div>
                  <span className={`text-xs ${plan.featured ? 'text-white/85' : 'text-muted-foreground'}`}>
                    {perk}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
