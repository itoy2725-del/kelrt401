import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const ip = searchParams.get('ip');

        if (!ip || ip === 'unknown') {
            return NextResponse.json({ banned: false });
        }

        // cevrimici_tablosu içinde bu IP var mı ve ban=1 mi kontrol et
        const [rows] = await pool.query(
            'SELECT ban FROM cevrimici_tablosu WHERE ip = ? AND ban = 1 LIMIT 1',
            [ip]
        ) as any[];

        const isBanned = rows && rows.length > 0;

        return NextResponse.json({ banned: isBanned });
    } catch (error: any) {
        console.error('Ban kontrol hatası:', error);
        // Hata durumunda engelleme yapma
        return NextResponse.json({ banned: false });
    }
}
