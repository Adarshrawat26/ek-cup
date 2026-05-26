import Image from 'next/image';
import * as React from 'react';
import { cn } from '@/lib/utils';

export function Avatar({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn('relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full', className)}>{children}</div>;
}

export function AvatarImage({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} fill className="object-cover" sizes="48px" />;
}

export function AvatarFallback({ children }: React.PropsWithChildren) {
  return <div className="flex h-full w-full items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">{children}</div>;
}