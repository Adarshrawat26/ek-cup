'use client';

import { usePathname } from 'next/navigation';

const STEPS = [
  { n: 1, label: 'Profile', path: '/onboarding/profile' },
  { n: 2, label: 'Payout',  path: '/onboarding/payout' },
  { n: 3, label: 'Done',    path: '/onboarding/done' },
];

export function StepIndicator() {
  const pathname = usePathname();
  const current = STEPS.find((s) => pathname.startsWith(s.path))?.n ?? 1;

  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300
                ${s.n < current
                  ? 'bg-brand-500 text-white'
                  : s.n === current
                  ? 'bg-brand-500 text-white ring-4 ring-brand-200'
                  : 'bg-gray-100 text-gray-400'}`}
            >
              {s.n < current ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : s.n}
            </div>
            <span className={`text-xs font-medium ${s.n === current ? 'text-brand-700' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`mb-5 h-0.5 w-16 transition-all duration-300 sm:w-28 ${s.n < current ? 'bg-brand-500' : 'bg-gray-100'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
