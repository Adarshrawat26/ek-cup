'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, Settings, ExternalLink, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Overview',     href: '/admin',              icon: LayoutDashboard },
  { label: 'Creators',     href: '/admin/creators',     icon: Users },
  { label: 'Transactions', href: '/admin/transactions', icon: CreditCard },
  { label: 'Settings',     href: '/admin/settings',     icon: Settings },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-brand-100 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-brand-100 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-lg shadow-warm">☕</div>
        <div>
          <div className="text-sm font-semibold leading-tight">Ek Cup</div>
          <div className="mt-0.5 inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-700">
            Admin
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-brand-500' : '')} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-brand-100 px-4 py-4 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-gray-50 hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          Creator dashboard
        </Link>
        <a
          href="/api/auth/signout"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </a>
        <div className="px-3 pt-2 text-xs text-muted-foreground truncate">{email}</div>
      </div>
    </aside>
  );
}
