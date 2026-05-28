'use client';

import { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { CreatorSummary } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/toast';
import { Skeleton } from '@/components/ui/skeleton';

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void | Promise<void>;
  modal: { ondismiss: () => void };
  prefill: { name: string };
  theme: { color: string };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const cups = [
  { count: 1, amount: 29 },
  { count: 3, amount: 87 },
  { count: 5, amount: 145 }
];

export function ChaiWidget({ creator, id, feePercent = 0 }: { creator: CreatorSummary; id?: string; feePercent?: number }) {
  const [selectedAmount, setSelectedAmount] = useState(29);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const finalAmount = useMemo(() => {
    const parsedCustomAmount = Number(customAmount);
    return Number.isFinite(parsedCustomAmount) && parsedCustomAmount > 0 ? parsedCustomAmount : selectedAmount;
  }, [customAmount, selectedAmount]);

  useEffect(() => {
    setHydrated(true);

    if (typeof window === 'undefined' || window.Razorpay) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  async function handleSupport() {
    setLoading(true);
    setSuccess(false);

    try {
      const createResp = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount, creatorUsername: creator.username, message, supporterName: undefined, cups: 1 })
      });

      const { order, keyId, creatorName } = await createResp.json();

      // If Razorpay is not configured (keyId empty) or server returned a mock order,
      // perform a local demo verification flow in dev to simulate a successful payment.
      const isMock = !keyId || (order && typeof order.id === 'string' && order.id.startsWith('mock_'));

      if (isMock) {
        try {
          const demoResp = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ razorpay_order_id: order.id, demo: true, supporterName: undefined, message, cups: 1 })
          });

          const demoJson = await demoResp.json();
          if (demoResp.ok && demoJson.ok) {
            confetti({ particleCount: 120, spread: 72, origin: { y: 0.7 } });
            setSuccess(true);
            toast({ title: 'Demo support sent', description: `Demo: Thanks for buying ${creator.name} a chai.` });
          } else {
            toast({ title: 'Demo verification failed', description: 'Could not complete demo support.' });
          }
        } catch (err) {
          toast({ title: 'Demo failed', description: 'Unable to complete demo payment.' });
        }

        setLoading(false);
        return;
      }

      const options: RazorpayOptions = {
        key: keyId,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: 'Ek Cup',
        description: `Buy ${creator.name} a chai ☕`,
        handler: async function (response: RazorpayResponse) {
          // verify
          const verifyResp = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              supporterName: customAmount ? undefined : undefined,
              message,
              cups: 1
            })
          });

          const verifyJson = await verifyResp.json();
          if (verifyResp.ok && verifyJson.ok) {
            confetti({ particleCount: 120, spread: 72, origin: { y: 0.7 } });
            setSuccess(true);
            toast({ title: 'Support sent successfully', description: `Thanks for buying ${creator.name} a chai.` });
          } else {
            toast({ title: 'Payment verification failed', description: 'We could not confirm your payment.' });
          }
        },
        modal: {
          ondismiss: () => {
            toast({ title: 'Checkout closed', description: 'Your support was not completed.' });
          }
        },
        prefill: {
          name: ''
        },
        theme: { color: '#C17B3C' }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast({ title: 'Razorpay not available', description: 'Payment SDK not loaded.' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Unable to start checkout', description: 'Please try again in a moment.' });
    } finally {
      setLoading(false);
    }
  }

  if (!hydrated) {
    return <ChaiWidgetSkeleton />;
  }

  return (
    <div id={id} className="sticky top-24 rounded-[2rem] border border-brand-200/70 bg-white/90 p-6 shadow-sm backdrop-blur dark:bg-card/80">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-700">Chai widget</p>
        <h2 className="text-2xl font-semibold">☕ Buy {creator.name.split(' ')[0]} a chai</h2>
        <p className="text-sm leading-6 text-muted-foreground">Small support, immediate delight. Demo mode is active if Razorpay keys are not set.</p>
      </div>

      {success ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-white px-4 py-3 text-brand-800 dark:bg-brand-900/20 dark:text-brand-200">
          <CheckCircle2 className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium">Thank you for the chai.</p>
            <p className="text-xs text-brand-700/80 dark:text-brand-200/80">Your support is helping {creator.name.split(' ')[0]} keep creating.</p>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-3 gap-2">
        {cups.map((cup) => (
          <button
            key={cup.count}
            type="button"
            onClick={() => {
              setSelectedAmount(cup.amount);
              setCustomAmount('');
            }}
            className={`rounded-2xl border px-3 py-4 text-left transition ${
              selectedAmount === cup.amount && !customAmount
                ? 'border-brand-500 bg-brand-50/80 ring-1 ring-brand-500/20'
                : 'border-border/70 bg-white hover:border-brand-300 hover:bg-brand-50/40'
            }`}
          >
            <div className="text-sm font-medium">{cup.count} cup{cup.count > 1 ? 's' : ''}</div>
            <div className="text-base font-semibold">₹{cup.amount}</div>
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        <Input
          type="number"
          min="1"
          placeholder="Custom amount"
          value={customAmount}
          onChange={(event) => setCustomAmount(event.target.value)}
        />
        <Textarea placeholder="Say something nice..." value={message} onChange={(event) => setMessage(event.target.value)} />
        <Button onClick={handleSupport} disabled={loading} className="w-full rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Creating payment…
            </span>
          ) : (
            `☕ Send ₹${finalAmount} chai`
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {feePercent > 0 ? `${feePercent}% platform fee applies · ` : ''}UPI, cards, netbanking accepted
        </p>
      </div>
    </div>
  );
}

function ChaiWidgetSkeleton() {
  return (
    <div className="rounded-[2rem] border bg-white p-6 shadow-sm dark:bg-card">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-3 h-8 w-56" />
      <div className="mt-5 grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mt-4 h-11 w-full" />
      <Skeleton className="mt-4 h-24 w-full" />
      <Skeleton className="mt-4 h-11 w-full rounded-full" />
    </div>
  );
}