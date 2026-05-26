"use client";

import React, { useState } from 'react';
import { useOnboarding } from '@/lib/onboarding-context';
import { useRouter } from 'next/navigation';

export default function PayoutStep() {
  const { data, setData } = useOnboarding();
  const [upiId, setUpiId] = useState(data.payout?.upiId ?? '');
  const [bankOpen, setBankOpen] = useState(false);
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function onNext() {
    setError('');

    let creatorId: string | undefined;
    try {
      const res = await fetch(`/api/creators/${data.username}`);
      if (res.ok) {
        const c = await res.json();
        creatorId = c.id;
      }
    } catch {
      // ignore network errors — will be caught below
    }

    if (!creatorId) {
      setError('Could not find your creator profile. Try going back and saving your profile again.');
      return;
    }

    const payload = {
      creatorId,
      upiId: upiId || undefined,
      ...(bankOpen ? { accountHolder, accountNumber, ifsc, bankName } : {})
    };

    await fetch('/api/onboarding/save-payout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setData({ payout: payload });
    router.push('/onboarding/done');
  }

  function onSkip() {
    router.push('/onboarding/done');
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="bg-white p-4 rounded-md border border-gray-100">
        <h2 className="text-lg font-semibold mb-2 text-slate-800">Set up your payout method</h2>
        <p className="text-sm text-slate-500 mb-4">Payments will be sent directly to this UPI ID</p>

        <div className="space-y-3">
          <div>
            <label className="text-sm block mb-1 text-slate-700">Your UPI ID</label>
            <input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="rounded-md border border-gray-100 p-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={bankOpen} onChange={(e) => setBankOpen(e.target.checked)} />
              Use bank account instead
            </label>
            {bankOpen && (
              <div className="mt-2 space-y-2">
                <input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} placeholder="Account holder name" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
                <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account number" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
                <input value={ifsc} onChange={(e) => setIfsc(e.target.value)} placeholder="IFSC code" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
                <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank name" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
              </div>
            )}
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="p-3 bg-gray-50 border border-gray-100 rounded-md text-sm text-slate-700">
            <div className="font-medium">Takes less than 2 mins</div>
            <div className="text-sm text-slate-500">Enter your UPI ID or bank details so we can send you payments directly.</div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end">
          <button onClick={onSkip} className="text-sm text-slate-500 underline cursor-pointer mr-4">Skip this step</button>
          <div className="flex-1 mr-4">
            <div className="h-1 bg-gray-100 rounded-full">
              <div className="h-1 bg-brand-500 rounded-full" style={{ width: '50%' }} />
            </div>
          </div>
          <button onClick={onNext} className="ml-4 px-4 py-2 rounded-md text-white bg-brand-500 text-sm">Next</button>
        </div>
      </div>
    </div>
  );
}
