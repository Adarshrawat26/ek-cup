import { spotlightCreators } from '@/lib/mock-data';

export function SocialProof() {
  const cards = [...spotlightCreators, ...spotlightCreators];

  return (
    <section className="overflow-hidden py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-700">Social proof</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Creators already earning with Ek Cup</h2>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="flex w-max gap-4 px-4 animate-marquee sm:px-6 lg:px-8">
          {cards.map((creator, index) => (
            <div key={`${creator.name}-${index}`} className="w-72 shrink-0 rounded-3xl border bg-white p-5 shadow-sm dark:bg-card">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                  {creator.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')}
                </div>
                <div>
                  <div className="font-semibold">{creator.name}</div>
                  <div className="text-sm text-muted-foreground">{creator.category}</div>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Earnings</span>
                <span className="font-semibold text-brand-700">{creator.earnings}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}