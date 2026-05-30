import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { SettingsForm } from '@/components/dashboard/settings-form';

export const metadata = { title: 'Settings — Ek Cup' };

export default async function SettingsPage() {
  const session = await getSession();
  const isDev = process.env.NODE_ENV !== 'production';

  if (!session?.user?.id && !isDev) redirect('/');

  let creator;

  if (session?.user?.id) {
    creator = await prisma.creator.findFirst({
      where: { userId: session.user.id },
      include: { payout: true },
    });
    if (!creator) redirect('/onboarding/profile');
  } else if (isDev) {
    creator = await prisma.creator.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { payout: true },
    });
  }

  if (!creator) redirect('/');

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground hover:text-foreground">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile and payout preferences.
        </p>
      </div>

      <SettingsForm
        creatorId={creator.id}
        initial={{
          name: creator.name,
          username: creator.username,
          bio: creator.bio,
          avatarUrl: creator.avatarUrl,
          tags: creator.tags,
          twitterUrl: creator.twitterUrl,
          payout: creator.payout
            ? {
                upiId: creator.payout.upiId,
                accountHolder: creator.payout.accountHolder,
                accountNumber: creator.payout.accountNumber,
                ifsc: creator.payout.ifsc,
                bankName: creator.payout.bankName,
              }
            : null,
        }}
      />
    </main>
  );
}
