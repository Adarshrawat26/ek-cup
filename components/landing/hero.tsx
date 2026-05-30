'use client';

import { Play, Heart, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { landingStats } from '@/lib/mock-data';
import { StartPageCta } from '@/components/landing/start-page-cta';
import { useState, useEffect } from 'react';

const NOTIFICATIONS = [
  { name: 'Priya S.', action: 'sent 3 cups ☕', amount: '₹147', color: 'bg-orange-100 text-orange-700' },
  { name: 'Rohit M.', action: 'joined Pro tier ⭐', amount: '₹299/mo', color: 'bg-amber-100 text-amber-700' },
  { name: 'Aditi K.', action: 'bought an ebook 📖', amount: '₹199', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Karan V.', action: 'sent a cup ☕', amount: '₹49', color: 'bg-orange-100 text-orange-700' },
];

export function Hero() {
  const [notifIndex, setNotifIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setNotifIndex((i) => (i + 1) % NOTIFICATIONS.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const notif = NOTIFICATIONS[notifIndex];

  return (
    <section id="explore" className="mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">

        {/* ── Left: copy ─────────────────────────────────────────────── */}
        <div className="space-y-8">
          <Badge>🇮🇳 Made for Indian creators</Badge>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Fund your passion,{' '}
              <span className="text-brand-600">one cup</span>{' '}
              at a time.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Accept support from your fans, start a membership, or sell your work.
              Simple, warm, and built for Bharat.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <StartPageCta />
            <Button variant="ghost" className="rounded-full border border-border px-6 text-base" asChild>
              <a href="#how-it-works">
                <span className="inline-flex items-center gap-2">
                  <Play className="h-4 w-4" /> See how it works
                </span>
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {landingStats.map((item) => (
              <div key={item.label} className="rounded-3xl border bg-white/70 p-4 shadow-sm dark:bg-card/70">
                <div className="text-2xl font-semibold text-brand-700 dark:text-brand-300">{item.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: creator page mockup ─────────────────────────────── */}
        <div className="relative flex justify-center lg:justify-end">
          {/* Glow behind card */}
          <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-200/60 via-amber-100/40 to-orange-100/30 blur-3xl" />

          {/* Phone-style card */}
          <div className="w-full max-w-[340px] overflow-hidden rounded-[2rem] border border-brand-200/60 bg-white shadow-[0_8px_48px_-12px_rgba(193,123,60,0.35)] dark:bg-card">

            {/* Fake browser bar */}
            <div className="flex items-center gap-1.5 border-b border-brand-100/60 bg-brand-50/60 px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
              <div className="ml-3 flex-1 rounded-full bg-white/80 px-3 py-0.5 text-[10px] text-muted-foreground">
                ekcup.in/adarsh
              </div>
            </div>

            {/* Page content mockup */}
            <div className="p-5 space-y-4">

              {/* Creator header */}
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-amber-500 text-xl font-bold text-white shadow-warm">
                  AK
                </div>
                <div>
                  <div className="font-semibold text-sm">Adarsh Kumar</div>
                  <div className="text-xs text-muted-foreground">Creator & Developer 🇮🇳</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-brand-600">
                    <Heart className="h-3 w-3 fill-brand-500 text-brand-500" />
                    <span>1,240 supporters</span>
                  </div>
                </div>
              </div>

              {/* Chai support widget */}
              <div className="rounded-2xl border border-brand-200/60 bg-brand-50/60 p-4">
                <div className="text-xs font-semibold uppercase tracking-widest text-brand-700 mb-3">
                  Send a cup of chai ☕
                </div>
                <div className="flex gap-2 mb-3">
                  {['₹49', '₹149', '₹499'].map((amt, i) => (
                    <button
                      key={amt}
                      className={`flex-1 rounded-xl py-1.5 text-xs font-semibold border transition-colors ${
                        i === 1
                          ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
                          : 'border-brand-200 bg-white text-brand-700'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
                <button className="w-full rounded-xl bg-brand-500 py-2 text-xs font-semibold text-white shadow-sm">
                  Support with UPI →
                </button>
              </div>

              {/* Recent supporters */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Recent supporters</span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                    Live
                  </span>
                </div>
                {[
                  { init: 'P', name: 'Priya', msg: '"Loved the video!" · 3 cups', color: 'bg-pink-100 text-pink-700' },
                  { init: 'R', name: 'Rohit', msg: '"Keep going!" · 1 cup', color: 'bg-blue-100 text-blue-700' },
                ].map((s) => (
                  <div key={s.name} className="flex items-center gap-2.5 rounded-xl bg-secondary/60 px-3 py-2">
                    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.color}`}>
                      {s.init}
                    </div>
                    <div>
                      <div className="text-xs font-medium">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground">{s.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating live notification */}
          <div
            className="absolute -bottom-4 -left-4 flex items-center gap-2.5 rounded-2xl border border-brand-200/60 bg-white px-3.5 py-2.5 shadow-[0_4px_20px_-4px_rgba(193,123,60,0.3)] transition-all duration-500 dark:bg-card"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(6px)' }}
          >
            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${notif.color}`}>
              {notif.name.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-semibold">{notif.name} <span className="font-normal text-muted-foreground">{notif.action}</span></div>
              <div className="text-xs font-semibold text-brand-600">{notif.amount}</div>
            </div>
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
          </div>

          {/* Top-right floating badge */}
          <div className="absolute -right-3 -top-3 flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[11px] font-semibold text-green-700 shadow-sm dark:bg-green-950/40">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            Your page is live
          </div>
        </div>

      </div>
    </section>
  );
}
