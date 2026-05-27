'use client';

import { useState } from 'react';

const PRESETS = [0, 2, 3, 5, 8, 10];

export function AdminFeeControl({ currentFee }: { currentFee: number }) {
  const [fee, setFee] = useState(currentFee);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

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
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setFee(p)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition
              ${fee === p
                ? 'bg-amber-500 text-white'
                : 'border border-gray-700 bg-gray-800 text-gray-300 hover:border-amber-500 hover:text-amber-400'}`}
          >
            {p}%
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5">
          <input
            type="number"
            min={0}
            max={100}
            value={fee}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (!isNaN(n) && n >= 0 && n <= 100) setFee(n);
            }}
            className="w-16 bg-transparent text-center text-lg font-bold text-white outline-none"
          />
          <span className="text-gray-400">%</span>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-50"
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Update Fee'}
        </button>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      {/* Live preview */}
      <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 text-sm text-gray-400">
        <p className="font-medium text-gray-300 mb-2">Live preview — for a ₹100 payment:</p>
        <div className="space-y-1">
          <div className="flex justify-between"><span>Supporter pays</span><span className="text-white">₹100.00</span></div>
          <div className="flex justify-between"><span>Platform fee ({fee}%)</span><span className="text-amber-400">₹{(100 * fee / 100).toFixed(2)}</span></div>
          <div className="flex justify-between font-semibold"><span>Creator receives</span><span className="text-green-400">₹{(100 * (100 - fee) / 100).toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}
