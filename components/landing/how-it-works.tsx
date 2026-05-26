import { howItWorks } from '@/lib/mock-data';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-700">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Four simple steps to start earning</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {howItWorks.map((step, index) => (
            <div key={step} className="flex flex-col justify-start gap-3 rounded-3xl border bg-white p-6 shadow-sm dark:bg-card">
              <div className="text-sm font-medium text-brand-700">0{index + 1}</div>
              <div className="text-xl font-semibold">{step}</div>
              <p className="text-sm text-muted-foreground">
                {index === 0 && 'Create a warm profile that feels like your own corner of the internet.'}
                {index === 1 && 'Share your Ek Cup link everywhere your audience already hangs out.'}
                {index === 2 && 'Fans send chai, join memberships, or buy digital work instantly.'}
                {index === 3 && 'Money lands fast with UPI-friendly payouts and clear tracking.'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}