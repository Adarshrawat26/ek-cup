/**
 * POST /api/onboarding/upload-avatar
 *
 * Accepts a base64-encoded image and stores it:
 *  - Cloudflare R2  → when CLOUDFLARE_R2_* env vars are set  (production)
 *  - Local filesystem (public/avatars/) → fallback for dev/demo
 *
 * R2 setup (free: 10 GB storage, zero egress cost):
 *  1. https://dash.cloudflare.com → R2 → Create bucket (e.g. "ekcup-avatars")
 *  2. R2 → Manage R2 API tokens → Create token (Object Read & Write)
 *  3. Make the bucket public: Settings → Public access → Allow
 *  4. Set env vars (see .env.example)
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, getClientIp, apiRes } from '@/lib/api-helpers';

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp']);

// ─── R2 client (created once, reused across requests) ────────────────────────
const r2 = (() => {
  const { CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY } =
    process.env;
  if (!CLOUDFLARE_R2_ACCOUNT_ID || !CLOUDFLARE_R2_ACCESS_KEY_ID || !CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
    return null;
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
  });
})();

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`upload-avatar:${ip}`, 10, 60_000)) return apiRes.rateLimited();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id && process.env.NODE_ENV === 'production') {
    return apiRes.unauthorized();
  }

  try {
    const body: { filename?: string; data?: string } = await req.json();
    const { filename, data } = body;

    if (!filename || !data) return apiRes.badRequest('filename and data are required.');

    // Parse data URL
    const match = data.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) return apiRes.badRequest('data must be a base64 data URL.');

    const mimeType = match[1];
    if (!ALLOWED_MIME.has(mimeType)) {
      return apiRes.badRequest('Only PNG, JPEG, and WebP images are allowed.');
    }

    const b64 = match[2];
    const buf = Buffer.from(b64, 'base64');

    if (buf.byteLength > MAX_FILE_SIZE_BYTES) {
      return apiRes.badRequest('File exceeds the 2 MB limit.');
    }

    const ext = mimeType === 'image/jpeg' ? '.jpg' : mimeType === 'image/webp' ? '.webp' : '.png';

    // Sanitize: strip path separators, keep only safe characters
    const safeName = path
      .basename(filename, path.extname(filename))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 60);

    const objectKey = `avatars/${Date.now()}-${safeName}${ext}`;

    // ── Upload to R2 ────────────────────────────────────────────────────────
    if (r2 && process.env.CLOUDFLARE_R2_BUCKET_NAME && process.env.CLOUDFLARE_R2_PUBLIC_URL) {
      await r2.send(
        new PutObjectCommand({
          Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
          Key: objectKey,
          Body: buf,
          ContentType: mimeType,
          // Make the object publicly readable
          ACL: 'public-read',
        })
      );

      const url = `${process.env.CLOUDFLARE_R2_PUBLIC_URL.replace(/\/$/, '')}/${objectKey}`;
      return NextResponse.json({ success: true, url });
    }

    // ── Fallback: local filesystem (dev only) ────────────────────────────────
    const outDir = path.join(process.cwd(), 'public', 'avatars');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `${Date.now()}-${safeName}${ext}`);
    fs.writeFileSync(outPath, buf);

    return NextResponse.json({ success: true, url: `/avatars/${path.basename(outPath)}` });
  } catch (err) {
    console.error('[upload-avatar]', err);
    return apiRes.serverError();
  }
}
