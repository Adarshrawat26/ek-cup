import { Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Priya Nair',
    role: 'UI Designer',
    city: 'Pune',
    quote: 'Got my first ₹4,200 in 3 days of just sharing my link. No pitch. No DMs.',
    gradient: 'from-orange-400 to-amber-500',
  },
  {
    name: 'Arjun Sen',
    role: 'Educator',
    city: 'Bengaluru',
    quote: 'Replaced 3 tools. My students pay me directly now. Zero middlemen.',
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    name: 'Ananya Mehta',
    role: 'Illustrator',
    city: 'Mumbai',
    quote: 'The chai widget on my page looks so good. Got my first supporter in 10 minutes.',
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    name: 'Rohan Verma',
    role: 'YouTuber',
    city: 'Delhi',
    quote: '₹3.2L last month. My audience wanted to support me — I just made it easy.',
    gradient: 'from-green-400 to-emerald-500',
  },
];

export function SocialProof() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
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

        {/* 2×2 static grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {TESTIMONIALS.map((t) => {
            const initials = t.name.split(' ').map((p) => p[0]).join('');
            return (
              <div
                key={t.name}
                className="flex flex-col justify-between gap-6 rounded-[1.75rem] border border-border/60 bg-white p-6 shadow-sm dark:bg-card"
              >
                {/* Quote */}
                <div>
                  <Quote className="mb-3 h-4 w-4 text-brand-300" />
                  <p className="text-sm leading-7 text-muted-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                {/* Creator info */}
                <div className="flex items-center gap-3 border-t border-border/50 pt-4">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-sm font-bold text-white`}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.role} · {t.city}
                    </div>
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
