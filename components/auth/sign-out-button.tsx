'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface SignOutButtonProps {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function SignOutButton({ variant = 'ghost', size = 'sm', className = '' }: SignOutButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm() {
    setIsLoading(true);
    await signOut({ callbackUrl: '/' });
  }

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        variant={variant}
        size={size}
        className={className}
      >
        Sign out
      </Button>

      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
        <DialogHeader>
          <DialogTitle>Sign out of Ek Cup?</DialogTitle>
          <DialogDescription>
            You'll need to sign in again to access your dashboard.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowConfirm(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Signing out…' : 'Yes, sign out'}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
