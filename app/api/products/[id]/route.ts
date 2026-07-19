import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        let product: any = null;
        
        // Önce slug ile ara
        let [rows] = await pool.query('SELECT * FROM products WHERE slug = ? LIMIT 1', [id]);
        let products = rows as any[];
        
        if (products.length > 0) {
            product = products[0];
        } else if (!isNaN(Number(id))) {
            // Slug ile bulunamadıysa ve id sayısal ise id ile dene
            [rows] = await pool.query('SELECT * FROM products WHERE id = ? LIMIT 1', [Number(id)]);
            products = rows as any[];
            if (products.length > 0) {
                product = products[0];
            }
        }
        
        if (!product) {
            return NextResponse.json({ success: false, error: 'Ürün bulunamadı' }, { status: 404 });
        }
        
        // images alanını parse et ve is_flash_sale'i boolean yap
        let images = product.images;
        if (typeof images === 'string') {
            try {
                images = JSON.parse(images);
            } catch {
                images = [];
            }
        }
        product.images = images;
        product.is_flash_sale = !!product.is_flash_sale;
        product.stock_limit = product.stock_limit != null ? Number(product.stock_limit) : null;
        
        // Benzer ürünleri tek sorguda getir (Waterfall önleme)
        let similarProducts: any[] = [];
        if (product.category_name) {
            const [similarRows] = await pool.query(
                'SELECT * FROM products WHERE category_name = ? AND id != ? ORDER BY created_at DESC LIMIT 8',
                [product.category_name, product.id]
            );
            similarProducts = (similarRows as any[]).map(p => {
                let pImages = p.images;
                if (typeof pImages === 'string') {
                    try {
                        pImages = JSON.parse(pImages);
                    } catch {
                        pImages = [];
                    }
                }
                return {
                    ...p,
                    images: pImages,
                    is_flash_sale: !!p.is_flash_sale,
                    stock_limit: p.stock_limit != null ? Number(p.stock_limit) : null,
                };
            });
        }
        
        // similarProducts'ı data objesine ekle
        return NextResponse.json({ 
            success: true, 
            data: {
                ...product,
                similarProducts
            } 
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await pool.query('DELETE FROM products WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        
        // is_flash_sale güncelleme
        if (typeof body.is_flash_sale !== 'undefined') {
            await pool.query(
                'UPDATE products SET is_flash_sale = ? WHERE id = ?',
                [body.is_flash_sale ? 1 : 0, id]
            );
        }
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}