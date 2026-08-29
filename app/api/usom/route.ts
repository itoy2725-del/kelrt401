import { NextRequest, NextResponse } from 'next/server';
import { getUsomSettings, runUsomCheck } from '@/lib/usom';

export const dynamic = 'force-dynamic';

function getDomain(req: NextRequest): string {
  const host = req.headers.get('host') || req.headers.get('x-forwarded-host') || process.env.VERCEL_URL || '';
  return host.replace(/:\d+$/, '');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'cron') {
    const settings = await getUsomSettings();
    if (!settings.enabled) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'USOM kontrolü kapalı' });
    }
    if (settings.last_check) {
      const lastTime = new Date(settings.last_check).getTime();
      if (Date.now() - lastTime < 840000) {
        return NextResponse.json({ ok: true, skipped: true, reason: '14 dakika geçmedi' });
      }
    }
    const domain = getDomain(req);
    const result = await runUsomCheck(domain);
    return NextResponse.json(result);
  }

  return NextResponse.json({ ok: false, error: 'Geçersiz action' }, { status: 400 });
}
