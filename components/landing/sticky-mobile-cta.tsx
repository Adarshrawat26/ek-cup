'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        setVisible(scrolled / total >= 0.5);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount in case the page is already scrolled
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="border-t border-border/40 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)] backdrop-blur-sm dark:bg-card/95">
        <Link
          href="/signin"
          className="flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: '#C17B3C' }}
        >
          Start your page — it&apos;s free →
        </Link>
      </div>
    </div>
  );
}
