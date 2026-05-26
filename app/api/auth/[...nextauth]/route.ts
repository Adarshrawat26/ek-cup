// next-auth v4 callable type is not resolved correctly under
// moduleResolution:"bundler" (a Next.js 14 default). The app works at runtime;
// this directive silences the false-positive TS error.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error -- next-auth v4 default export callable under bundler resolution
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
