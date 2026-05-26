import Link from 'next/link';
import { Instagram, Youtube, X } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500 text-lg text-white">☕</div>
            <div>
              <div className="font-semibold">Ek Cup</div>
              <div className="text-sm text-muted-foreground">Made with ❤️ for Indian creators</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
          <Link href="#">About</Link>
          <Link href="#">Help</Link>
          <Link href="#">Privacy</Link>
          <Link href="#">Terms</Link>
        </div>

        <div className="flex items-center gap-3 text-muted-foreground">
          <Instagram className="h-4 w-4" />
          <Youtube className="h-4 w-4" />
          <X className="h-4 w-4" />
        </div>
      </div>
    </footer>
  );
}