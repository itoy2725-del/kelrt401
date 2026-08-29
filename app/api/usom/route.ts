import { NextRequest, NextResponse } from 'next/server';
import { getUsomSettings, runUsomCheck } from '@/lib/usom';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'cron') {
    const settings = await getUsomSettings();
    if (!settings.enabled) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'USOM kontrolü kapalı' });
    }
    if (!settings.target_domain) {
      return NextResponse.json({ ok: false, error: 'Target domain ayarlanmamış. Panelden ayarlayın.' });
    }
    if (settings.last_check) {
      const lastTime = new Date(settings.last_check).getTime();
      if (Date.now() - lastTime < 840000) {
        return NextResponse.json({ ok: true, skipped: true, reason: '14 dakika geçmedi' });
      }
    }
    const result = await runUsomCheck(settings.target_domain);
    return NextResponse.json(result);
  }

  return NextResponse.json({ ok: false, error: 'Geçersiz action' }, { status: 400 });
}
