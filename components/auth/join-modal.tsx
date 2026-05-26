"use client";

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { X } from 'lucide-react';

type Props = { open: boolean; onClose: () => void };

export default function JoinModal({ open, onClose }: Props) {
  const [hasGoogle, setHasGoogle] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState<'google' | 'email' | null>(null);

  useEffect(() => {
    if (!open) return;
    setSent(false);
    setEmail('');
    setLoading(null);
    fetch('/api/auth/providers')
      .then((r) => r.json())
      .then((p) => {
        setHasGoogle(Boolean(p?.google));
        setHasEmail(Boolean(p?.email));
      })
      .catch(() => {});
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  async function handleGoogle() {
    if (!hasGoogle) {
      onClose();
      window.location.href = '/onboarding/profile';
      return;
    }
    setLoading('google');
    await signIn('google', { callbackUrl: '/dashboard' });
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    if (!hasEmail) {
      onClose();
      window.location.href = '/onboarding/profile';
      return;
    }
    setLoading('email');
    await signIn('email', { email, callbackUrl: '/dashboard', redirect: false });
    setSent(true);
    setLoading(null);
  }

  if (!open) return null;

  return (
    // Full-screen backdrop — stops scroll, centers modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-brand-200/60 bg-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition hover:bg-brand-50 hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-2xl shadow-warm">
              ☕
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Welcome to Ek Cup</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to start your creator page
            </p>
          </div>

          {sent ? (
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 text-center">
              <p className="text-sm font-medium text-brand-800">✉️ Magic link sent!</p>
              <p className="mt-1 text-sm text-muted-foreground">Check your inbox and click the link to sign in.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading === 'google'}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-brand-50 disabled:opacity-60"
              >
                {/* Google logo */}
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading === 'google' ? 'Redirecting…' : 'Continue with Google'}
              </button>

              {/* Divider */}
              {hasEmail && (
                <>
                  <div className="flex items-center gap-3">
                    <hr className="flex-1 border-border/60" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <hr className="flex-1 border-border/60" />
                  </div>

                  {/* Email magic link */}
                  <form onSubmit={handleEmail} className="space-y-2">
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none ring-brand-500 transition focus:ring-2"
                    />
                    <button
                      type="submit"
                      disabled={loading === 'email'}
                      className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
                    >
                      {loading === 'email' ? 'Sending…' : 'Send magic link'}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          <p className="mt-5 text-center text-xs text-muted-foreground">
            By continuing you agree to our{' '}
            <a href="#" className="underline hover:text-foreground">Terms</a> &{' '}
            <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
