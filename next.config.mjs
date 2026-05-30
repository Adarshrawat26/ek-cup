/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';

// script-src: dev needs 'unsafe-eval' for React Fast Refresh / hot reload.
// Production keeps it off for security.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com"
  : "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com";

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://lh3.googleusercontent.com https://images.unsplash.com",
      "connect-src 'self' https://api.resend.com https://checkout.razorpay.com https://lumberjack.razorpay.com",
      "frame-src https://api.razorpay.com https://checkout.razorpay.com",
      "font-src 'self' data:",
    ].join('; '),
  },
];

const nextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
