import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const jsonData = body.jsonData || body;

        // JSON-LD formatından verileri çıkar
        const mainEntity = jsonData.mainEntity?.offers?.itemOffered?.[0] || {};
        const offer = mainEntity.offers || {};

        // Temel bilgiler
        const name = mainEntity.name || jsonData.name?.replace(' - Migros', '') || 'Ürün';
        const url = mainEntity.url || jsonData.url || '';
        
        // SKU oluştur (URL'den veya rastgele)
        let slug = url.split('/').pop()?.replace('p-', '') || '';
        let sku = slug.replace(/-/g, '').substring(0, 50) || `SKU${Date.now()}`;

        // Fiyat (kuruş cinsinden kaydet)
        const priceStr = offer.price || '0';
        const price = Math.round(parseFloat(priceStr) * 100);

        // Marka
        const brandName = mainEntity.brand?.name || '';

        // Kategori
        const categoryPath = mainEntity.category || offer.category || '';
        const categoryName = categoryPath.split('/')[0] || '';

        // Resimler
        let images: string[] = [];
        if (mainEntity.image && Array.isArray(mainEntity.image)) {
            images = mainEntity.image.map((img: any) => img.contentUrl || img).filter(Boolean);
        }
        const imageUrl = images[0] || offer.image || '';

        // Açıklama
        const description = jsonData.description || '';

        // Stok durumu
        const availability = offer.availability || '';
        const inStock = !availability.includes('OutOfStock');

        console.log('Eklenecek ürün:', { sku, name, price, brandName, imageUrl });

        // Veritabanına ekle
        await pool.query(`
            INSERT INTO products (sku, name, slug, description, price, regular_price, brand_name, category_name, image_url, images, in_stock, json_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                name = VALUES(name),
                slug = VALUES(slug),
                description = VALUES(description),
                price = VALUES(price),
                regular_price = VALUES(regular_price),
                brand_name = VALUES(brand_name),
                category_name = VALUES(category_name),
                image_url = VALUES(image_url),
                images = VALUES(images),
                in_stock = VALUES(in_stock),
                json_data = VALUES(json_data),
                updated_at = CURRENT_TIMESTAMP
        `, [
            sku,
            name,
            slug,
            description,
            price,
            price,
            brandName,
            categoryName,
            imageUrl,
            JSON.stringify(images),
            inStock,
            JSON.stringify(jsonData)
        ]);

        return NextResponse.json({
            success: true,
            message: 'Ürün başarıyla eklendi',
            data: {
                sku,
                name,
                price,
                brandName,
                imageUrl
            }
        });

    } catch (error: any) {
        console.error('Ürün ekleme hatası:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC LIMIT 100');
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}