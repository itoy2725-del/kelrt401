import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Session ID oluştur veya al
function getSessionId(request: NextRequest): string {
    const sessionCookie = request.cookies.get('cart_session');
    if (sessionCookie) {
        return sessionCookie.value;
    }
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

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

// Sepete ürün eklendiğinde kaydet
export async function POST(request: NextRequest) {
    try {
        const { product_id, amount, cart_total } = await request.json();
        const sessionId = getSessionId(request);
        const ip = getClientIP(request);

        // Önce bu session için bu ürün var mı kontrol et
        const [existing] = await pool.query(
            'SELECT id, amount FROM cart_items WHERE session_id = ? AND product_id = ?',
            [sessionId, product_id]
        ) as any[];

        if (existing && existing.length > 0) {
            // Ürün zaten var, miktarı ve tutarı güncelle
            await pool.query(
                'UPDATE cart_items SET amount = ?, ip_address = ?, cart_total = ?, created_at = NOW() WHERE id = ?',
                [amount, ip, cart_total || 0, existing[0].id]
            );
        } else {
            // Yeni kayıt ekle
            await pool.query(
                'INSERT INTO cart_items (session_id, ip_address, product_id, amount, cart_total, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                [sessionId, ip, product_id, amount, cart_total || 0]
            );
        }

        // Aynı session'daki diğer ürünlerin cart_total değerini de güncelle
        if (cart_total) {
            await pool.query(
                'UPDATE cart_items SET cart_total = ?, ip_address = ? WHERE session_id = ?',
                [cart_total, ip, sessionId]
            );
        }

        const response = NextResponse.json({ success: true, sessionId });
        
        // Session cookie'sini set et (30 gün geçerli)
        response.cookies.set('cart_session', sessionId, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60,
            path: '/'
        });

        return response;
    } catch (error: any) {
        console.error('Sepet kaydetme hatası:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Sepetten ürün silme
export async function DELETE(request: NextRequest) {
    try {
        const { product_id } = await request.json();
        const sessionId = getSessionId(request);

        await pool.query(
            'DELETE FROM cart_items WHERE session_id = ? AND product_id = ?',
            [sessionId, product_id]
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}