/**
 * Admin auth guard.
 * Set ADMIN_EMAIL in .env to your email. Only that email can access /admin.
 */
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

export async function requireAdmin(): Promise<{ email: string } | null> {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  if (!adminEmail) return null; // not configured — block all

  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email?.toLowerCase();

  if (!userEmail || userEmail !== adminEmail) return null;
  return { email: userEmail };
}

export function isAdminEmail(email?: string | null): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  return Boolean(adminEmail && email?.toLowerCase() === adminEmail);
}
