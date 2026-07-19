import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

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

// Tek adres getir
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const ip = getClientIP(request);
        
        const [rows] = await pool.query(
            'SELECT * FROM addresses WHERE id = ? AND ip_address = ?',
            [id, ip]
        );
        
        const addresses = rows as any[];
        if (addresses.length === 0) {
            return NextResponse.json({ success: false, error: 'Adres bulunamadı' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: addresses[0] });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Adres güncelle
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const ip = getClientIP(request);
        const body = await request.json();
        
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

        if (is_default) {
            await pool.query(
                'UPDATE addresses SET is_default = FALSE WHERE ip_address = ?',
                [ip]
            );
        }

        await pool.query(
            `UPDATE addresses SET 
                title = ?, first_name = ?, last_name = ?, phone = ?, 
                city = ?, district = ?, neighborhood = ?, street = ?,
                building_no = ?, floor_no = ?, door_no = ?, address_description = ?, is_default = ?
             WHERE id = ? AND ip_address = ?`,
            [title, first_name, last_name, phone, city, district, neighborhood, street, building_no, floor_no, door_no, address_description, is_default || false, id, ip]
        );

        return NextResponse.json({ success: true, message: 'Adres güncellendi' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Adres sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const ip = getClientIP(request);
        
        console.log('Silme isteği - ID:', id, 'IP:', ip); // Debug log
        
        const [result] = await pool.query(
            'DELETE FROM addresses WHERE id = ? AND ip_address = ?',
            [id, ip]
        ) as any[];
        
        console.log('Silme sonucu:', result); // Debug log

        return NextResponse.json({ success: true, message: 'Adres silindi' });
    } catch (error: any) {
        console.error('Silme hatası:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}