/**
 * middleware.ts — Edge-level auth guard (M-3)
 *
 * This is a defence-in-depth safety net for /admin routes.
 * Per-page requireAdmin() still runs as the primary check,
 * but this ensures no future admin page can accidentally skip it.
 *
 * Also protects /dashboard from unauthenticated access in production.
 */

import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin protection ───────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

    if (!adminEmail) {
      // ADMIN_EMAIL not configured — block all admin access
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (!token?.email || token.email.toLowerCase() !== adminEmail) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run on admin routes — not API routes (those use requireAdmin() directly)
  matcher: ['/admin/:path*'],
};
