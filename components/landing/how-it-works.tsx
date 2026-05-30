import { UserCircle, Share2, Heart, Wallet } from 'lucide-react';
import { howItWorks } from '@/lib/mock-data';

const STEP_META = [
  {
    icon: UserCircle,
    color: 'bg-brand-100 text-brand-600',
    desc: 'Create a warm profile that feels like your own corner of the internet.',
  },
  {
    icon: Share2,
    color: 'bg-purple-100 text-purple-600',
    desc: 'Share your Ek Cup link everywhere your audience already hangs out.',
  },
  {
    icon: Heart,
    color: 'bg-rose-100 text-rose-600',
    desc: 'Fans send chai, join memberships, or buy your digital work instantly.',
  },
  {
    icon: Wallet,
    color: 'bg-green-100 text-green-600',
    desc: 'Money lands fast with UPI-friendly payouts and clear tracking.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Up and running in minutes
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Four steps. No code. No fees to start.
        </p>
      </div>

      {/* Steps */}
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {howItWorks.map((step, index) => {
          const meta = STEP_META[index];
          const Icon = meta.icon;
          return (
            <div key={step} className="relative flex flex-col gap-4">
              {/* Connector line (hidden on last item) */}
              {index < howItWorks.length - 1 && (
                <div className="absolute left-[3.25rem] top-[1.375rem] hidden h-0.5 w-[calc(100%-1.5rem)] bg-gradient-to-r from-brand-200 to-transparent lg:block" />
              )}

              <div className="relative z-10 w-fit rounded-2xl border border-brand-100 bg-white p-3 shadow-sm dark:bg-card">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">
                  Step {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="mt-1.5 text-lg font-semibold">{step}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{meta.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
