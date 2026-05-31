import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { getServerSession } from 'next-auth/next';
import type { Session, User } from 'next-auth';
import { prisma } from './prisma';

// Build provider list dynamically — only include what's configured in env.
// This lets the app run in demo mode locally without any OAuth setup.
const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          // Always show the Google account picker so the user can choose
          // which account to sign in with (even if already signed in).
          prompt: 'select_account',
        },
      },
    })
  );
}

if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.push(
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    })
  );
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' as const },
  providers,
  debug: process.env.NODE_ENV !== 'production',
  pages: { signIn: '/signin', error: '/auth-error' },
  // Fix "State cookie was missing" in local dev — http:// doesn't support
  // Secure cookies so we have to explicitly allow them over plain HTTP.
  cookies: process.env.NODE_ENV !== 'production' ? {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
    },
    state: {
      name: 'next-auth.state',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
    },
  } : undefined,
  callbacks: {
    /**
     * Attach user.id to the session so all client/server code can read it
     * via session.user.id without an extra DB lookup.
     */
    async session({ session, user }: { session: Session; user: User }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },

    /**
     * Called after every successful sign-in.
     * If this is the user's first time (no Creator linked yet), we leave them
     * to go through onboarding.  If they already have a Creator, nothing to do.
     */
    async signIn({ user }: { user: User }) {
      // Always allow sign-in — onboarding handles creator creation
      return true;
    },
  },
};

/**
 * Type-safe wrapper around next-auth v4 getServerSession.
 *
 * next-auth v4's session-callback signature is incompatible with TypeScript 5.9+
 * strict-mode inference when passed `authOptions` directly. All call sites use
 * this helper so the single `as any` cast lives in one place.
 */
export async function getSession(): Promise<Session | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getServerSession(authOptions as any) as Promise<Session | null>;
}
