"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useOnboarding } from '@/lib/onboarding-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

const TAGS = ['Art','Music','Writing','Education','Tech','Comedy','Finance','Gaming','Podcast','Other'];

export default function ProfileStep() {
  const { data, setData } = useOnboarding();

  const [name, setName] = useState(data.name || '');
  const [username, setUsername] = useState(data.username || '');
  const [bio, setBio] = useState(data.bio || '');
  const [socialLink, setSocialLink] = useState(data.socialLink || '');
  const [tags, setTags] = useState<string[]>(data.tags || []);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(data.avatarUrl);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => { if (!username && name) setUsername(name.replace(/\s+/g,'').toLowerCase()); }, []);

  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      const u = username;
      if (!u || u.length < 3) { setUsernameAvailable(false); setChecking(false); return; }
      setChecking(true);
      try {
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(u)}`);
        const json = await res.json();
        setUsernameAvailable(json.available);
      } catch (e) {
        setUsernameAvailable(false);
      }
      setChecking(false);
    }, 500);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [username]);

  function toggleTag(t: string) {
    setTags(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev,t]);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/image\/(png|jpe?g)/.test(f.type)) return alert('Only PNG/JPG');
    if (f.size > 2_000_000) return alert('Max 2MB');
    const reader = new FileReader();
    reader.onload = async () => {
      const base = reader.result as string;
      setAvatarPreview(base);
      // upload
      const res = await fetch('/api/onboarding/upload-avatar', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ filename: f.name, data: base }) });
      const j = await res.json();
      if (j.success) setAvatarPreview(j.url);
    };
    reader.readAsDataURL(f);
  }

  async function onNext() {
    if (!name || !username || usernameAvailable !== true) return;

    setLoading(true);
    setError('');

    try {
      // Save profile server-side — server reads identity from session
      const res = await fetch('/api/onboarding/save-profile', {
        method: 'POST',
        headers: { 'content-type':'application/json' },
        body: JSON.stringify({ name, username, bio, avatarUrl: avatarPreview, tags, socialLink })
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Failed to save profile. Please try again.');
        setLoading(false);
        return;
      }

      const json = await res.json();

      // Store profile and creatorId in context for next step
      setData({
        name,
        username,
        bio,
        avatarUrl: avatarPreview,
        tags,
        socialLink,
        creatorId: json.creatorId
      });

      router.push('/onboarding/payout');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Create your profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Set up your public page and earnings account</p>
        </div>

        <div className="flex gap-6">
          {/* Avatar section */}
          <div className="flex flex-shrink-0 flex-col items-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-secondary">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <svg className="h-8 w-8 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9 9 0 1118.88 6.196 9 9 0 015.12 17.804z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              )}
            </div>
            <label className="mt-3 cursor-pointer text-sm text-brand-700 hover:underline">
              <span>Upload photo</span>
              <input onChange={onUpload} accept="image/*" type="file" className="hidden" />
            </label>
          </div>

          {/* Form fields */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={e=>setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Your page URL</label>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">ekcup.in/</div>
                <Input
                  value={username}
                  onChange={e=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g,''))}
                  placeholder="username"
                  className="flex-1"
                />
                <div className="w-6 text-center">
                  {checking ? '…' : usernameAvailable === true ? <span className="text-green-600">✓</span> : usernameAvailable === false ? <span className="text-red-600">✕</span> : null}
                </div>
              </div>
              {usernameAvailable === false && username && <p className="mt-1 text-xs text-red-600">Username not available</p>}
            </div>

            <div>
              <label className="text-sm font-medium">About</label>
              <Textarea
                value={bio}
                onChange={e=>setBio(e.target.value.slice(0,300))}
                placeholder="Write about your passion and what drives you."
                rows={4}
              />
              <div className="mt-1 text-xs text-right text-muted-foreground">{bio.length}/300</div>
            </div>

            <div>
              <label className="text-sm font-medium">Website or social link</label>
              <Input
                value={socialLink}
                onChange={e=>setSocialLink(e.target.value)}
                placeholder="https://twitter.com/yourhandle"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category tags</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {TAGS.map(t=> (
                  <button
                    key={t}
                    type="button"
                    onClick={()=>toggleTag(t)}
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

        {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="mt-8 flex justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
          >
            ← Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!name || !username || usernameAvailable!==true || loading}
            size="default"
          >
            {loading ? 'Saving...' : 'Next'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
