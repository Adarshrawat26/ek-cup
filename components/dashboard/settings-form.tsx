'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const TAGS = ['Art', 'Music', 'Writing', 'Education', 'Tech', 'Comedy', 'Finance', 'Gaming', 'Podcast', 'Other'];

type PayoutData = {
  upiId?: string | null;
  accountHolder?: string | null;
  accountNumber?: string | null;
  ifsc?: string | null;
  bankName?: string | null;
};

type Props = {
  creatorId: string;
  initial: {
    name: string;
    username: string;
    bio: string | null;
    avatarUrl: string | null;
    tags: string;
    twitterUrl: string | null;
    payout: PayoutData | null;
  };
};

type Tab = 'profile' | 'payout';

export function SettingsForm({ creatorId, initial }: Props) {
  const [tab, setTab] = useState<Tab>('profile');

  // ── Profile state ─────────────────────────────────────────────────────────
  const [name, setName] = useState(initial.name);
  const [bio, setBio] = useState(initial.bio ?? '');
  const [socialLink, setSocialLink] = useState(initial.twitterUrl ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(initial.avatarUrl ?? undefined);
  const [tags, setTags] = useState<string[]>(initial.tags ? initial.tags.split(',').filter(Boolean) : []);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // ── Payout state ──────────────────────────────────────────────────────────
  const [upiId, setUpiId] = useState(initial.payout?.upiId ?? '');
  const [bankOpen, setBankOpen] = useState(Boolean(initial.payout?.accountNumber));
  const [accountHolder, setAccountHolder] = useState(initial.payout?.accountHolder ?? '');
  const [accountNumber, setAccountNumber] = useState(initial.payout?.accountNumber ?? '');
  const [ifsc, setIfsc] = useState(initial.payout?.ifsc ?? '');
  const [bankName, setBankName] = useState(initial.payout?.bankName ?? '');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutMsg, setPayoutMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function toggleTag(t: string) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/image\/(png|jpe?g)/.test(f.type)) { alert('Only PNG/JPG'); return; }
    if (f.size > 2_000_000) { alert('Max 2 MB'); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const base = reader.result as string;
      setAvatarPreview(base);
      const res = await fetch('/api/onboarding/upload-avatar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ filename: f.name, data: base }),
      });
      const j = await res.json();
      if (j.success) setAvatarPreview(j.url);
    };
    reader.readAsDataURL(f);
  }

  async function saveProfile() {
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await fetch('/api/onboarding/save-profile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          username: initial.username,   // username locked after onboarding
          bio,
          avatarUrl: avatarPreview,
          tags,
          socialLink,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setProfileMsg({ ok: false, text: json.error ?? 'Failed to save. Please try again.' });
      } else {
        setProfileMsg({ ok: true, text: 'Profile saved!' });
      }
    } catch {
      setProfileMsg({ ok: false, text: 'Network error. Please try again.' });
    } finally {
      setProfileLoading(false);
    }
  }

  async function savePayout() {
    setPayoutLoading(true);
    setPayoutMsg(null);
    try {
      const res = await fetch('/api/onboarding/save-payout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          upiId: upiId || undefined,
          ...(bankOpen ? { accountHolder, accountNumber, ifsc, bankName } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPayoutMsg({ ok: false, text: json.error ?? 'Failed to save. Please try again.' });
      } else {
        setPayoutMsg({ ok: true, text: 'Payout settings saved!' });
      }
    } catch {
      setPayoutMsg({ ok: false, text: 'Network error. Please try again.' });
    } finally {
      setPayoutLoading(false);
    }
  }

  // Auto-clear success message after 4s
  useEffect(() => {
    if (!profileMsg?.ok) return;
    const t = setTimeout(() => setProfileMsg(null), 4000);
    return () => clearTimeout(t);
  }, [profileMsg]);

  useEffect(() => {
    if (!payoutMsg?.ok) return;
    const t = setTimeout(() => setPayoutMsg(null), 4000);
    return () => clearTimeout(t);
  }, [payoutMsg]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border bg-secondary p-1 w-fit">
        {(['profile', 'payout'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2 text-sm font-medium capitalize transition-colors
              ${tab === t
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {t === 'profile' ? '👤 Profile' : '💰 Payout'}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {tab === 'profile' && (
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Edit Profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These details appear on your public page.
              <span className="ml-1 font-medium text-foreground">Username cannot be changed.</span>
            </p>
          </div>

          <div className="flex gap-6">
            {/* Avatar */}
            <div className="flex flex-shrink-0 flex-col items-center">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-secondary">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9 9 0 1118.88 6.196 9 9 0 015.12 17.804z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>
              <label className="mt-2 cursor-pointer text-xs text-brand-700 hover:underline">
                Change photo
                <input onChange={onUpload} accept="image/*" type="file" className="hidden" />
              </label>
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-sm font-medium">Display name</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>

              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={`ekcup.in/${initial.username}`}
                  disabled
                  className="cursor-not-allowed opacity-60"
                />
                <p className="mt-1 text-xs text-muted-foreground">Username is locked after account creation.</p>
              </div>

              <div>
                <label className="text-sm font-medium">About</label>
                <Textarea
                  value={bio}
                  onChange={e => setBio(e.target.value.slice(0, 300))}
                  placeholder="Tell supporters about yourself…"
                  rows={4}
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">{bio.length}/300</p>
              </div>

              <div>
                <label className="text-sm font-medium">Website or social link</label>
                <Input
                  value={socialLink}
                  onChange={e => setSocialLink(e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category tags</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TAGS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        tags.includes(t)
                          ? 'border-brand-300 bg-brand-100 text-brand-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-brand-200 hover:bg-brand-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {profileMsg && (
            <div className={`mt-4 rounded-xl p-3 text-sm ${profileMsg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {profileMsg.ok ? '✓ ' : '✕ '}{profileMsg.text}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={saveProfile} disabled={profileLoading}>
              {profileLoading ? 'Saving…' : 'Save profile'}
            </Button>
          </div>
        </Card>
      )}

      {/* ── PAYOUT TAB ── */}
      {tab === 'payout' && (
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Payout Settings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Where do you want to receive your earnings?
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">UPI ID</label>
              <Input
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="yourname@upi"
              />
            </div>

            <div className="rounded-xl border p-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={bankOpen}
                  onChange={e => setBankOpen(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                Use bank account instead
              </label>
              {bankOpen && (
                <div className="mt-4 space-y-3">
                  <Input value={accountHolder} onChange={e => setAccountHolder(e.target.value)} placeholder="Account holder name" />
                  <Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Account number" />
                  <Input value={ifsc} onChange={e => setIfsc(e.target.value)} placeholder="IFSC code" />
                  <Input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Bank name" />
                </div>
              )}
            </div>
          </div>

          {payoutMsg && (
            <div className={`mt-4 rounded-xl p-3 text-sm ${payoutMsg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {payoutMsg.ok ? '✓ ' : '✕ '}{payoutMsg.text}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={savePayout} disabled={payoutLoading}>
              {payoutLoading ? 'Saving…' : 'Save payout settings'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
