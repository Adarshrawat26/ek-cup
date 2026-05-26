"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { PayoutData } from './types';

type ProfileState = {
  name?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  tags?: string[];
  socialLink?: string;
  payout?: PayoutData;
};

type OnboardingContextValue = {
  data: ProfileState;
  setData: (patch: Partial<ProfileState>) => void;
  clear: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

const STORAGE_KEY = 'ekcup:onboarding';

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<ProfileState>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDataState(JSON.parse(raw));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }, [data]);

  function setData(patch: Partial<ProfileState>) {
    setDataState(prev => ({ ...(prev || {}), ...patch }));
  }

  function clear() {
    setDataState({});
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  return (
    <OnboardingContext.Provider value={{ data, setData, clear }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}

export default OnboardingProvider;
