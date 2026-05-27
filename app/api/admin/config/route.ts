import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { invalidateConfigCache } from '@/lib/platform-config';

/** GET /api/admin/config — return all platform config key-value pairs */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const configs = await prisma.platformConfig.findMany({ orderBy: { key: 'asc' } });
  return NextResponse.json({ configs });
}

/** PATCH /api/admin/config — update a single key */
export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { key, value } = body as { key?: string; value?: string };

  if (!key || typeof value !== 'string') {
    return NextResponse.json({ error: 'key and value are required' }, { status: 400 });
  }

  // Validate known keys
  if (key === 'platform_fee_percent') {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      return NextResponse.json({ error: 'Fee must be 0–100' }, { status: 400 });
    }
  }

  const updated = await prisma.platformConfig.upsert({
    where: { key },
    update: { value, updatedBy: admin.email },
    create: { key, value, updatedBy: admin.email },
  });

  // Bust the in-memory cache so the new value takes effect immediately
  invalidateConfigCache(key);

  return NextResponse.json({ config: updated });
}
