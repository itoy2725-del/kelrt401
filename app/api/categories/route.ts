import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [rows] = await pool.query(
            'SELECT DISTINCT category_name FROM products WHERE category_name IS NOT NULL AND category_name != "" ORDER BY category_name ASC'
        );

        const categories = (rows as any[]).map(row => row.category_name);

        return NextResponse.json({ success: true, data: categories });
    } catch (error: any) {
        console.error('Kategori getirme hatası:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
