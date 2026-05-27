'use client';

import { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';

const PRESETS = [0, 2, 3, 5, 8, 10];

export function AdminFeeControl({ currentFee }: { currentFee: number }) {
  const [fee, setFee] = useState(currentFee);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const dirty = fee !== currentFee;

  async function save() {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'platform_fee_percent', value: String(fee) }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? 'Failed to save');
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setSaving(false);
    }
  }

  const exampleGross = 10000; // ₹100 in paise
  const exampleFee = Math.floor(exampleGross * fee / 100);
  const exampleNet = exampleGross - exampleFee;

  return (
    <div className="space-y-5">
      {/* Preset chips */}
      <div>
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setFee(p)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition border ${
                fee === p
                  ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
                  : 'border-brand-200 bg-white text-brand-700 hover:border-brand-400 hover:bg-brand-50'
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
      </div>

      {/* Custom input + save */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-2xl border border-brand-200 bg-white px-4 py-2.5 focus-within:ring-2 focus-within:ring-brand-500 transition">
          <input
            type="number"
            min={0}
            max={100}
            value={fee}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (!isNaN(n) && n >= 0 && n <= 100) setFee(n);
            }}
            className="w-14 bg-transparent text-center text-lg font-bold text-foreground outline-none"
          />
          <span className="text-muted-foreground font-medium">%</span>
        </div>

        <button
          onClick={save}
          disabled={saving || saved}
          className={`flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-brand-500 text-white hover:bg-brand-600'
          }`}
        >
          {saved ? (
            <><Check className="h-4 w-4" /> Saved</>
          ) : saving ? (
            'Saving…'
          ) : (
            'Update Fee'
          )}
        </button>

        {dirty && !saving && !saved && (
          <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Live preview */}
      <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
          Live preview — ₹100 payment
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Supporter pays</span>
            <span className="font-semibold">₹100.00</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Platform fee ({fee}%)</span>
            <span className={`font-semibold ${fee > 0 ? 'text-brand-700' : 'text-muted-foreground'}`}>
              ₹{(exampleFee / 100).toFixed(2)}
            </span>
          </div>
          <div className="my-1 border-t border-brand-100" />
          <div className="flex items-center justify-between">
            <span className="font-semibold">Creator receives</span>
            <span className="font-bold text-green-600">₹{(exampleNet / 100).toFixed(2)}</span>
          </div>
        </div>
        {fee === 0 && (
          <p className="mt-3 rounded-xl bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
            🎉 0% fee — early creator mode. Creators keep 100%.
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Changes take effect within 60 seconds across all payment flows. No redeploy required.
      </p>
    </div>
  );
}
