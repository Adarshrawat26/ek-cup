import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { invalidateConfigCache } from '@/lib/platform-config';
import { checkRateLimit, getClientIp, apiRes } from '@/lib/api-helpers';

/** GET /api/admin/config — return all platform config key-value pairs */
export async function GET(req: Request) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`admin-config-get:${ip}`, 60, 60_000)) return apiRes.rateLimited();

  const admin = await requireAdmin();
  if (!admin) return apiRes.forbidden();

  const configs = await prisma.platformConfig.findMany({ orderBy: { key: 'asc' } });
  return NextResponse.json({ configs });
}

/** PATCH /api/admin/config — update a single key */
export async function PATCH(req: Request) {
  const ip = getClientIp(req);
  if (!await checkRateLimit(`admin-config-patch:${ip}`, 20, 60_000)) return apiRes.rateLimited();

  const admin = await requireAdmin();
  if (!admin) return apiRes.forbidden();

  const body = await req.json().catch(() => ({}));
  const { key, value } = body as { key?: string; value?: string };

  if (!key || typeof value !== 'string') {
    return apiRes.badRequest('key and value are required.');
  }

  // Validate known keys
  if (key === 'platform_fee_percent') {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      return apiRes.badRequest('Fee must be 0–100.');
    }
  }

  const updated = await prisma.platformConfig.upsert({
    where: { key },
    update: { value, updatedBy: admin.email },
    create: { key, value, updatedBy: admin.email },
  });

  // Bust Redis + in-memory cache so new value is reflected immediately everywhere
  await invalidateConfigCache(key);

  return NextResponse.json({ config: updated });
}
