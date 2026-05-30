import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import OnboardingProvider from '@/lib/onboarding-context';
import { StepIndicator } from '@/components/onboarding/step-indicator';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { getSession } from '@/lib/auth';

export const metadata = { title: 'Get started — Ek Cup' };

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // Auth gate: in production, redirect unauthenticated users to home
  // In development, allow unauthenticated access for testing
  if (process.env.NODE_ENV === 'production') {
    const session = await getSession();
    if (!session?.user?.id) {
      redirect('/');
    }
  }

  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-amber-50/40">

        {/* Header */}
        <header className="border-b border-brand-100/60 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-lg text-white shadow-warm">
                ☕
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">Ek Cup</div>
                <div className="text-xs text-muted-foreground">एक कप</div>
              </div>
            </Link>
            <SignOutButton size="sm" />
          </div>
        </header>

        {/* Step indicator */}
        <div className="mx-auto flex max-w-4xl justify-center px-4 pt-8 sm:px-6">
          <StepIndicator />
        </div>

        <main className="pb-16 pt-8">{children}</main>
      </div>
    </OnboardingProvider>
  );
}
