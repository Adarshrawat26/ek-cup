import Link from 'next/link';
import { pricingPlans } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-700">Pricing</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Fair pricing for Bharat</h2>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.featured ? 'border-brand-500 shadow-warm ring-1 ring-brand-500/20' : 'border-border/70'}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.featured ? <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white">Featured</span> : null}
              </div>
              <CardDescription className="text-base">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-4xl font-semibold tracking-tight text-brand-700 dark:text-brand-300">{plan.price}</div>
              <Button className="w-full rounded-full bg-brand-500 text-white hover:bg-brand-600" asChild>
                <Link href="/dashboard">Choose {plan.name}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}