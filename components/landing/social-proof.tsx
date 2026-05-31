import { spotlightCreators } from '@/lib/mock-data';
import { Quote } from 'lucide-react';

const QUOTES: Record<string, string> = {
  'Riya Nair':    '"Finally a platform that gets Indian creators. My fans pay with UPI in 2 taps!"',
  'Arjun Sen':    '"Replaced 3 different tools. My students support me directly now, no middlemen."',
  'Ananya Mehta': '"The chai widget on my page looks so good. Got my first supporter in 10 minutes."',
  'Vikram Das':   '"Ek Cup just works. No complicated setup, no waiting 30 days for payouts."',
  'Sonia Kapoor': '"My listeners love sending cups. It feels personal, not like a transaction."',
  'Dev Sharma':   '"Best ₹0 investment I made. Setup was done before my chai got cold."',
};

const AVATAR_COLORS = [
  'from-orange-400 to-amber-500',
  'from-purple-400 to-pink-500',
  'from-blue-400 to-cyan-500',
  'from-green-400 to-emerald-500',
  'from-rose-400 to-pink-500',
  'from-indigo-400 to-purple-500',
];

export function SocialProof() {
  const cards = [...spotlightCreators, ...spotlightCreators];

  return (
    <section className="overflow-hidden py-16 lg:py-24">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">
            Social proof
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Creators already earning with Ek Cup
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real creators. Real earnings. Paid straight to their UPI.
          </p>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative mt-12">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

        <div className="flex w-max gap-5 px-4 animate-marquee">
          {cards.map((creator, index) => {
            const initials = creator.name.split(' ').map((p) => p[0]).join('');
            const quote = QUOTES[creator.name] ?? `"Ek Cup changed how I earn online."`;
            const gradientClass = AVATAR_COLORS[index % AVATAR_COLORS.length];

            return (
              <div
                key={`${creator.name}-${index}`}
                className="flex w-[300px] shrink-0 flex-col justify-between gap-4 rounded-[1.75rem] border border-border/60 bg-white p-6 shadow-sm dark:bg-card"
              >
                {/* Quote */}
                <div>
                  <Quote className="mb-3 h-4 w-4 text-brand-300" />
                  <p className="text-sm leading-7 text-muted-foreground">{quote}</p>
                </div>

                {/* Creator info + earnings */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradientClass} text-sm font-bold text-white`}>
                      {initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{creator.name}</div>
                      <div className="text-xs text-muted-foreground">{creator.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-brand-700">{creator.earnings}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">/ month</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
