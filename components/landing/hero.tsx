import { Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { landingStats } from '@/lib/mock-data';
import { StartPageCta } from '@/components/landing/start-page-cta';

export function Hero() {
  return (
    <section id="explore" className="mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <Badge>🇮🇳 Made for Indian creators</Badge>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Fund your passion, one cup at a time.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Accept support from your fans, start a membership, or sell your work. Simple, warm, and built for Bharat.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <StartPageCta />
            <Button variant="ghost" className="rounded-full border border-border px-6 text-base" asChild>
              <a href="#how-it-works"><span className="inline-flex items-center gap-2"><Play className="h-4 w-4" /> See how it works</span></a>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {landingStats.map((item) => (
              <div key={item.label} className="rounded-3xl border bg-white/70 p-4 shadow-sm dark:bg-card/70">
                <div className="text-2xl font-semibold text-brand-700 dark:text-brand-300">{item.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-brand-100 blur-3xl dark:bg-brand-900/30" />
          <div className="glass overflow-hidden rounded-[2rem] border p-6 shadow-warm">
            <div className="rounded-[1.5rem] bg-white p-6 shadow-sm dark:bg-card">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-2xl text-white shadow-warm">☕</div>
                <div>
                  <div className="text-lg font-semibold">Ek Cup</div>
                  <div className="text-sm text-muted-foreground">एक कप for creators who feel local</div>
                </div>
              </div>
              <div className="mt-6 space-y-4 rounded-3xl bg-secondary p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Recent support</span>
                  <span className="text-sm font-medium text-brand-700">Live</span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl bg-background p-4 shadow-sm">
                    <div className="text-sm font-medium">Aditi bought 5 cups</div>
                    <div className="text-sm text-muted-foreground">“Your newsletter saved my week.”</div>
                  </div>
                  <div className="rounded-2xl bg-background p-4 shadow-sm">
                    <div className="text-sm font-medium">Rahul joined Pro membership</div>
                    <div className="text-sm text-muted-foreground">Instant UPI confirmation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}