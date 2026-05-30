'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

function SignInContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/dashboard';
  const error = params.get('error');

  const [loading, setLoading] = useState<'google' | null>(null);

  // Already signed in → redirect
  useEffect(() => {
    if (status === 'authenticated') router.replace(callbackUrl);
  }, [status, router, callbackUrl]);

  // While session resolves, still render the form (avoids flash of blank screen)
  // The useEffect above will redirect if already authenticated

  async function handleGoogle() {
    setLoading('google');
    await signIn('google', { callbackUrl });
  }

  const errorMessages: Record<string, string> = {
    OAuthCallback: 'Google sign-in failed. Make sure the redirect URI is set in Google Console.',
    OAuthSignin: 'Could not start Google sign-in. Try again.',
    Default: 'Something went wrong. Please try again.',
  };
  const errorMsg = error ? (errorMessages[error] ?? errorMessages.Default) : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-hero-gradient p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-2xl text-white shadow-warm">
              ☕
            </div>
            <span className="text-lg font-semibold">Ek Cup</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your creator account</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-brand-200/60 bg-white p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

          <button
            onClick={handleGoogle}
            disabled={loading === 'google'}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-white px-4 py-3.5 text-sm font-medium shadow-sm transition hover:bg-brand-50 disabled:opacity-60"
          >
            {loading === 'google' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading === 'google' ? 'Redirecting to Google…' : 'Continue with Google'}
          </button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don't have an account?{' '}
            <button onClick={handleGoogle} className="font-medium text-brand-700 hover:underline">
              Sign up — it's free
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">← Back to homepage</Link>
        </p>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
