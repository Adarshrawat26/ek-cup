"use client";

import React, { useState } from 'react';
import { useOnboarding } from '@/lib/onboarding-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function DoneStep() {
  const { data, clear } = useOnboarding();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const url = data.username
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://ekcup.in'}/${data.username}`
    : '';

  async function finish() {
    setLoading(true);

    // Mark onboarding as complete
    if (data.creatorId) {
      try {
        await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ creatorId: data.creatorId })
        });
      } catch {
        // continue regardless of error
      }
    }

    clear();
    router.push('/dashboard');
  }

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:px-6">
      <Card className="p-6 text-center">
        <div className="text-6xl">☕</div>
        <h1 className="mt-4 text-2xl font-semibold">Your Ek Cup page is live!</h1>
        <p className="mt-2 break-all text-sm text-muted-foreground font-mono">{url}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={copy}>
            {copied ? 'Copied!' : 'Copy link'}
          </Button>
          <Button asChild>
            <a href={url} target="_blank" rel="noreferrer">
              Visit page
            </a>
          </Button>
        </div>

        <div className="mt-8 border-t pt-8">
          <p className="text-sm font-medium">Share your page</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="outline" asChild>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just set up my Ek Cup page! Support my work here ☕ ${url} #EkCup #CreatorEconomy`)}`}
                target="_blank"
                rel="noreferrer"
              >
                Share on Twitter
              </a>
            </Button>
            <Button variant="outline" onClick={copy}>
              {copied ? 'Copied!' : 'Copy link'}
            </Button>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" onClick={() => router.push('/')}>
            ← Back to home
          </Button>
          <Button onClick={finish} size="lg" disabled={loading}>
            {loading ? 'Redirecting...' : 'Go to dashboard'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
