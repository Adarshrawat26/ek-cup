"use client";

import React, { useState } from 'react';
import { useOnboarding } from '@/lib/onboarding-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function PayoutStep() {
  const { data, setData } = useOnboarding();
  const [upiId, setUpiId] = useState(data.payout?.upiId ?? '');
  const [bankOpen, setBankOpen] = useState(false);
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onNext() {
    setError('');
    setLoading(true);

    // Use creatorId from context (stored during profile step)
    const creatorId = data.creatorId;
    if (!creatorId) {
      setError('Creator profile not found. Please go back and save your profile again.');
      setLoading(false);
      return;
    }

    const payload = {
      creatorId,
      upiId: upiId || undefined,
      ...(bankOpen ? { accountHolder, accountNumber, ifsc, bankName } : {})
    };

    try {
      const res = await fetch('/api/onboarding/save-payout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Failed to save payout method. Please try again.');
        setLoading(false);
        return;
      }

      setData({ payout: payload });
      router.push('/onboarding/done');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  function onSkip() {
    router.push('/onboarding/done');
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:px-6">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Set up payouts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Payments will be sent directly to this account</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Your UPI ID</label>
            <Input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              type="text"
            />
          </div>

          <div className="rounded-lg border p-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={bankOpen}
                onChange={(e) => setBankOpen(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Use bank account instead
            </label>
            {bankOpen && (
              <div className="mt-4 space-y-3">
                <Input
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Account holder name"
                />
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Account number"
                />
                <Input
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  placeholder="IFSC code"
                />
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Bank name"
                />
              </div>
            )}
          </div>

          <div className="rounded-lg bg-secondary p-4 text-sm">
            <div className="font-medium">Takes less than 2 minutes</div>
            <p className="mt-1 text-muted-foreground">Enter your UPI ID or bank details so we can send you payments directly.</p>
          </div>

          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        </div>

        <div className="mt-8 flex justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push('/onboarding/profile')}
          >
            ← Back
          </Button>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onSkip}>
              Skip for now
            </Button>
            <Button onClick={onNext} disabled={loading}>
              {loading ? 'Saving...' : 'Continue'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
