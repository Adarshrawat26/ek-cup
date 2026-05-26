import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
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
  pages: { signIn: '/' },
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
