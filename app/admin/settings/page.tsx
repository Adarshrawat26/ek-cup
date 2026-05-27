import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AdminFeeControl } from '@/components/admin/fee-control';
import { Percent, Database, ShieldCheck, Clock } from 'lucide-react';

export const revalidate = 0; // Always fresh — settings page

export default async function AdminSettings() {
  const admin = await requireAdmin();
  if (!admin) redirect('/');

  // Load all platform config entries
  const configs = await prisma.platformConfig.findMany({
    orderBy: { key: 'asc' },
  });

  const feeConfig = configs.find((c) => c.key === 'platform_fee_percent');
  const currentFee = parseInt(feeConfig?.value ?? '0', 10);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform-wide configuration. Changes apply within 60 seconds — no redeploy needed.
        </p>
      </div>

      {/* Settings grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

        {/* Fee control */}
        <div className="rounded-[2rem] border border-brand-200/60 bg-white p-7 shadow-sm">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Platform Fee</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Cut taken from each successful payment. Set to 0 for early-creator mode.
              </p>
            </div>
          </div>
          <AdminFeeControl currentFee={currentFee} />
        </div>

        {/* Info panel */}
        <div className="space-y-4">

          {/* Current config values */}
          <div className="rounded-[2rem] border border-brand-200/60 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                <Database className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold">Config Store</h3>
            </div>
            {configs.length > 0 ? (
              <div className="space-y-3">
                {configs.map((c) => (
                  <div key={c.key} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-muted-foreground truncate">{c.key}</p>
                      {c.updatedAt && (
                        <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                          Updated {new Date(c.updatedAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                      {c.value}
                      {c.key === 'platform_fee_percent' ? '%' : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No config entries yet. Save a fee to create one.</p>
            )}
          </div>

          {/* Admin info */}
          <div className="rounded-[2rem] border border-brand-200/60 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold">Admin Access</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Logged in as</span>
                <span className="font-medium text-xs truncate max-w-[160px]">{admin.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Access level</span>
                <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                  Super Admin
                </span>
              </div>
            </div>
          </div>

          {/* Cache info */}
          <div className="rounded-[2rem] border border-brand-200/60 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold">Cache TTL</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Fee changes are cached for <strong className="text-foreground">60 seconds</strong> in each
              server instance. New payments will reflect the updated fee within one minute.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
