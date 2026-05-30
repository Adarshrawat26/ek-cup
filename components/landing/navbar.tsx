'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import JoinModal from '@/components/auth/join-modal';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

const links = [
  { label: 'Explore', href: '#explore' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
];

export function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-xl text-white shadow-warm">
              ☕
            </div>
            <div>
              <div className="text-base font-semibold leading-tight">Ek Cup</div>
              <div className="text-xs text-muted-foreground">एक कप</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {session ? (
              <>
                <Button className="rounded-full bg-brand-500 px-5 text-white hover:bg-brand-600" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <SignOutButton variant="outline" className="rounded-full" />
              </>
            ) : (
              <>
                <Button variant="ghost" className="rounded-full px-4" asChild>
                  <Link href="/signin">Sign in</Link>
                </Button>
                <Button
                  className="rounded-full bg-brand-500 px-5 text-white hover:bg-brand-600"
                  onClick={() => setModalOpen(true)}
                >
                  Start my page
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={cn('md:hidden', menuOpen ? 'block border-t border-border/60' : 'hidden')}>
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-border/60" />
            {session ? (
              <>
                <Button className="justify-start rounded-2xl bg-brand-500 px-3 text-white hover:bg-brand-600" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start rounded-2xl px-3"
                  onClick={() => setMenuOpen(false)}
                  asChild
                >
                  <SignOutButton />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="justify-start rounded-2xl px-3" asChild>
                  <Link href="/signin" onClick={() => setMenuOpen(false)}>Sign in</Link>
                </Button>
                <Button
                  className="justify-start rounded-2xl bg-brand-500 px-3 text-white hover:bg-brand-600"
                  onClick={() => { setMenuOpen(false); setModalOpen(true); }}
                >
                  Start my page
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Modal lives outside header so it's not clipped by z-index / overflow */}
      <JoinModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
