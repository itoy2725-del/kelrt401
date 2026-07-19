import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// IP adresini al - request'ten direkt al
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

// Adresleri getir
export async function GET(request: NextRequest) {
    try {
        const ip = getClientIP(request);
        
        console.log('Adres GET - IP:', ip); // Debug log
        
        const [rows] = await pool.query(
            'SELECT * FROM addresses WHERE ip_address = ? ORDER BY is_default DESC, created_at DESC',
            [ip]
        );
        
        return NextResponse.json({ 
            success: true, 
            data: rows,
            ip: ip 
        });
    } catch (error: any) {
        console.error('Adres getirme hatası:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Yeni adres ekle
export async function POST(request: NextRequest) {
    try {
        const ip = getClientIP(request);
        const body = await request.json();
        
        console.log('Adres POST - IP:', ip); // Debug log
        
        const {
            title,
            first_name,
            last_name,
            phone,
            city,
            district,
            neighborhood,
            street,
            building_no,
            floor_no,
            door_no,
            address_description,
            is_default
        } = body;

        // Eğer varsayılan adres olarak işaretlendiyse, diğerlerini güncelle
        if (is_default) {
            await pool.query(
                'UPDATE addresses SET is_default = FALSE WHERE ip_address = ?',
                [ip]
            );
        }

        const [result] = await pool.query(
            `INSERT INTO addresses (ip_address, title, first_name, last_name, phone, city, district, neighborhood, street, building_no, floor_no, door_no, address_description, is_default)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [ip, title, first_name, last_name, phone, city, district, neighborhood, street, building_no, floor_no, door_no, address_description, is_default || false]
        );

        return NextResponse.json({ 
            success: true, 
            message: 'Adres başarıyla eklendi',
            id: (result as any).insertId,
            ip: ip
        });
    } catch (error: any) {
        console.error('Adres ekleme hatası:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}