"use client";

import React, { useEffect, useState } from 'react';
import { useOnboarding } from '@/lib/onboarding-context';
import { useRouter } from 'next/navigation';

export default function DoneStep() {
  const { data, clear } = useOnboarding();
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const url = data.username
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://ekcup.in'}/${data.username}`
    : '';

  async function finish() {
    if (data.username) {
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: data.username })
      });
    }
    clear();
    router.push(data.username ? `/dashboard?username=${encodeURIComponent(data.username)}` : '/dashboard');
  }

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-6xl">☕</div>
        <h2 className="text-2xl font-semibold mt-4">Your Ek Cup page is live!</h2>
        <p className="mt-2 text-slate-600">{url}</p>
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={copy} className="px-3 py-1 rounded-md border">
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <a href={url} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-md border">Visit</a>
        </div>

        <div className="mt-4">
          <div className="text-sm text-slate-600">Share your page</div>
          <div className="flex justify-center gap-2 mt-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just set up my Ek Cup page! Support my work here ☕ ${url} #EkCup #CreatorEconomy`)}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 border rounded-md"
            >
              Twitter
            </a>
            <button onClick={copy} className="px-3 py-1 border rounded-md">
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <button onClick={finish} className="px-6 py-2 rounded-full text-white bg-brand-500">
            Go to my dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
