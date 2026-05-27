import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { AdminSidebar } from '@/components/admin/sidebar';

export const metadata = { title: 'Admin — Ek Cup' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect('/');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar email={admin.email} />
      <div className="flex-1 overflow-y-auto">
        <main className="mx-auto max-w-6xl px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
