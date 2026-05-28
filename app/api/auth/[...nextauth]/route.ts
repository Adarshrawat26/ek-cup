import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// next-auth v4 default export is not callable under moduleResolution:"bundler"
// at the TS level, but works fine at runtime. Using @ts-ignore (not @ts-expect-error
// which errors when the suppression is unused in stricter TS versions).
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- next-auth v4 callable at runtime
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
