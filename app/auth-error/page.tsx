'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const ERROR_MESSAGES: Record<string, { title: string; fix: string }> = {
  OAuthSignin:       { title: 'Failed to start sign-in', fix: 'Try again. If it persists, check that Google is configured in .env.' },
  OAuthCallback:     { title: 'Google sign-in failed', fix: 'Google returned an error. Make sure http://localhost:3000/api/auth/callback/google is in your Authorized redirect URIs in Google Console.' },
  OAuthCreateAccount:{ title: 'Could not create account', fix: 'The database might be unreachable. Check your DATABASE_URL in .env.' },
  EmailCreateAccount:{ title: 'Could not create account', fix: 'Check your database connection.' },
  Callback:          { title: 'Callback error', fix: 'A database or configuration error occurred during sign-in.' },
  OAuthAccountNotLinked: { title: 'Account conflict', fix: 'An account with this email already exists using a different sign-in method.' },
  SessionRequired:   { title: 'Sign in required', fix: 'You need to be signed in to access this page.' },
  Default:           { title: 'Authentication error', fix: 'Something went wrong. Check the server console for details.' },
};

function AuthErrorContent() {
  const params = useSearchParams();
  const error = params.get('error') ?? 'Default';
  const info = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-2xl">⚠️</div>
        <h1 className="text-xl font-semibold text-red-700">{info.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{info.fix}</p>

        <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 font-mono text-xs text-gray-500">
          Error code: <span className="font-semibold text-gray-700">{error}</span>
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="rounded-full border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
