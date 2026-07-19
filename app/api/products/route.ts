import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const brand = searchParams.get('brand');
        const limit = searchParams.get('limit') || '50';

        let query = 'SELECT * FROM products WHERE 1=1';
        const params: any[] = [];

        if (category === 'elektrikli') {
            query += ' AND id IN (46, 39, 38, 37, 26)';
        } else if (category) {
            query += ' AND category_name = ?';
            params.push(category);
        }

        if (brand) {
            query += ' AND brand_name = ?';
            params.push(brand);
        }

        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(Number(limit));

        const [rows] = await pool.query(query, params);

        // images alanını parse et ve is_flash_sale'i boolean yap
        const products = (rows as any[]).map(product => {
            let images = product.images;
            if (typeof images === 'string') {
                try {
                    images = JSON.parse(images);
                } catch {
                    images = [];
                }
            }
            return { 
                ...product, 
                images,
                is_flash_sale: !!product.is_flash_sale,
                stock_limit: product.stock_limit != null ? Number(product.stock_limit) : null,
            };
        });

        return NextResponse.json({ success: true, data: products });
    } catch (error: any) {
        console.error('Ürün getirme hatası:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}