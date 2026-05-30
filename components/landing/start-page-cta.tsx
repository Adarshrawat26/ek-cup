'use client';

import { ArrowRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import JoinModal from '@/components/auth/join-modal';

export function StartPageCta() {
  const { data: session } = useSession();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        className="rounded-full bg-brand-500 px-6 text-base text-white hover:bg-brand-600"
        onClick={(e) => {
          e.preventDefault();
          // Signed-in users go to /dashboard — it redirects to onboarding if they
          // haven't set up a page yet, or shows their dashboard if they have.
          if (session) window.location.href = '/dashboard';
          else setModalOpen(true);
        }}
      >
        <span className="inline-flex items-center gap-2">
          Start my page - it's free <ArrowRight className="h-4 w-4" />
        </span>
      </Button>
      <JoinModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
