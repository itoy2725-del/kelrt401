import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        // Tüm ürünlerin is_flash_sale durumunu kontrol et
        const [rows] = await pool.query('SELECT id, name, is_flash_sale FROM products');
        
        // Flash sale olan ürünleri filtrele
        const allProducts = rows as any[];
        const flashProducts = allProducts.filter(p => p.is_flash_sale === 1);
        
        return NextResponse.json({ 
            success: true, 
            total: allProducts.length,
            flashSaleCount: flashProducts.length,
            flashProducts: flashProducts,
            allProducts: allProducts.map(p => ({
                id: p.id,
                name: p.name?.substring(0, 30),
                is_flash_sale: p.is_flash_sale
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
