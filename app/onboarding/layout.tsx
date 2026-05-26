import React from 'react';
import OnboardingProvider from '@/lib/onboarding-context';

export const metadata = { title: 'Onboarding - Ek Cup' };

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-white text-slate-900">
        <header className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="text-2xl">☕</div>
            <div className="font-semibold">Ek Cup | एक कप</div>
          </div>
          <div>
            <a href="/api/auth/signout" className="text-sm text-slate-600">Logout</a>
          </div>
        </header>
        <main className="py-6">{children}</main>
      </div>
    </OnboardingProvider>
  );
}
