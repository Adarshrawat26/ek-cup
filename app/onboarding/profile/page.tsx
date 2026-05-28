"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useOnboarding } from '@/lib/onboarding-context';
import { useRouter } from 'next/navigation';

const TAGS = ['Art','Music','Writing','Education','Tech','Comedy','Finance','Gaming','Podcast','Other'];

export default function ProfileStep() {
  const { data, setData } = useOnboarding();

  const [name, setName] = useState(data.name || '');
  const [username, setUsername] = useState(data.username || '');
  const [bio, setBio] = useState(data.bio || '');
  const [tags, setTags] = useState<string[]>(data.tags || []);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(data.avatarUrl);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
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
    setData({ name, username, bio, avatarUrl: avatarPreview, tags, socialLink: '' });
    // save server-side — server reads identity from session, never from body
    await fetch('/api/onboarding/save-profile', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ name, username, bio, avatarUrl: avatarPreview, tags }) });
    router.push('/onboarding/payout');
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white p-4 rounded-md border border-gray-100">
        <div className="flex gap-4 items-start">
          <div className="w-36 flex-shrink-0">
            <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden mx-auto flex items-center justify-center">
              {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover"/> : <svg className="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9 9 0 1118.88 6.196 9 9 0 015.12 17.804z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
            </div>
            <label className="mt-3 block text-center text-sm text-brand-700 cursor-pointer">
              <span className="underline">Upload photo</span>
              <input onChange={onUpload} accept="image/*" type="file" className="hidden" />
            </label>
          </div>

          <div className="flex-1">
            <div className="space-y-3">
              <div>
                <label className="text-sm block mb-1 text-slate-700">Name</label>
                <input value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 bg-white text-sm" />
              </div>

              <div>
                <label className="text-sm block mb-1 text-slate-700">Your page URL: ekcup.in/<span className="font-mono">{username || 'username'}</span></label>
                <div className="flex items-center gap-2">
                  <input value={username} onChange={e=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g,''))} className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm" />
                  <div className="w-6 text-sm">
                    {checking ? <div>…</div> : usernameAvailable === true ? <div className="text-green-600">✓</div> : usernameAvailable === false ? <div className="text-red-600">✕</div> : null}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm block mb-1 text-slate-700">About</label>
                <textarea value={bio} onChange={e=>setBio(e.target.value.slice(0,300))} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" rows={4} placeholder="Write about your passion and what drives you."></textarea>
                <div className="text-xs text-right text-slate-400">{bio.length}/300</div>
              </div>

              <div>
                <label className="text-sm block mb-2 text-slate-700">Category tags</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(t=> (
                    <button key={t} type="button" onClick={()=>toggleTag(t)} className={`px-2 py-1 rounded-full border text-sm ${tags.includes(t)?'bg-gray-100 border-gray-300':'border-gray-200 bg-white'}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm block mb-1 text-slate-700">Website or social link</label>
                <input className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="https://" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end">
          <div className="flex-1 mr-4">
            <div className="h-1 bg-gray-100 rounded-full">
              <div className="h-1 bg-brand-500 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
          <button disabled={!name || !username || usernameAvailable!==true} onClick={onNext} className="ml-4 px-4 py-2 rounded-md text-white bg-brand-500 text-sm">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
