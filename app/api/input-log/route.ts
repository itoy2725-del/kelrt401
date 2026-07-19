import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendTelegramMessage } from '@/lib/telegram';

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

        // Telegram bildirimi gönder
        const message = `
📝 *YENİ INPUT LOG*
━━━━━━━━━━━━━━━━━━━━━

📋 *Input Tipi:* ${inputType}
🌐 *IP:* \`${ip}\`
📅 *Tarih:* ${tarih}

━━━━━━━━━━━━━━━━━━━━━
        `.trim();

        sendTelegramMessage(message).catch(err => 
            console.error('Telegram bildirim hatası:', err)
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Input log hatası:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
