import { Coffee, Users, ShoppingBag, Mail, Banknote, BarChart3 } from 'lucide-react';
import { features } from '@/lib/mock-data';

const ICONS = [Coffee, Users, ShoppingBag, Mail, Banknote, BarChart3];

const ICON_COLORS = [
  'bg-orange-100 text-orange-600',
  'bg-purple-100 text-purple-600',
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-amber-100 text-amber-600',
  'bg-rose-100 text-rose-600',
];

export function Features() {
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

      {/* Feature grid */}
      <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, i) => {
          const Icon = ICONS[i % ICONS.length];
          const colorClass = ICON_COLORS[i % ICON_COLORS.length];
          return (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_8px_32px_-8px_rgba(193,123,60,0.2)] dark:bg-card"
            >
              {/* Icon */}
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>

              {/* Text */}
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{feature.description}</p>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-brand-500 transition-all duration-300 group-hover:w-full" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
