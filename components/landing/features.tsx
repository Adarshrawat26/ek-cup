import { features } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-700">Features</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Everything you need to earn</h2>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="group border-border/70 transition hover:-translate-y-1 hover:shadow-warm">
            <CardHeader>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription className="text-base leading-7">{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-1.5 w-16 rounded-full bg-brand-500/30 transition group-hover:w-24 group-hover:bg-brand-500" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}