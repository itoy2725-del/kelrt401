import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
};

// Karaca listing sayfasından ürün linklerini ve temel bilgilerini çek
async function getProductsFromListing(categoryUrl: string): Promise<{ urls: string[], listingData: Map<string, any> }> {
    const res = await fetch(categoryUrl, { headers: HEADERS });
    const html = await res.text();

    // 1. JSON-LD ItemList'ten ürün bilgilerini çek
    const listingData = new Map<string, any>();
    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let jmatch;
    while ((jmatch = jsonLdRegex.exec(html)) !== null) {
        try {
            const data = JSON.parse(jmatch[1]);
            if (data['@type'] === 'ItemList' && data.itemListElement) {
                for (const item of data.itemListElement) {
                    const product = item.item;
                    if (product && product.name) {
                        // Ürün adından slug oluştur
                        const nameSlug = product.name
                            .toLowerCase()
                            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u')
                            .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g')
                            .replace(/İ/g, 'i').replace(/Ö/g, 'o').replace(/Ü/g, 'u')
                            .replace(/Ş/g, 's').replace(/Ç/g, 'c').replace(/Ğ/g, 'g')
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/-+/g, '-')
                            .replace(/^-|-$/g, '');
                        
                        listingData.set(nameSlug, {
                            name: product.name,
                            description: product.description || '',
                            images: Array.isArray(product.image) ? product.image : (product.image ? [product.image] : []),
                            price: product.offers?.price || 0,
                            availability: product.offers?.availability || 'InStock',
                            rating: product.aggregateRating?.ratingValue || 0,
                            reviewCount: product.aggregateRating?.reviewCount || 0,
                        });
                    }
                }
            }
        } catch (e) { /* parse hatası */ }
    }

    // 2. Tam URL formatında ürün linklerini çek: href="https://www.karaca.com/urun/..."
    const urlRegex = /href="(https:\/\/www\.karaca\.com\/urun\/[^"]+)"/g;
    const urls: string[] = [];
    const seen = new Set<string>();
    let match;
    while ((match = urlRegex.exec(html)) !== null) {
        const url = match[1];
        if (!seen.has(url)) {
            seen.add(url);
            urls.push(url);
        }
    }

    return { urls, listingData };
}

// Ürün detay sayfasından tüm bilgileri çek
async function scrapeProductDetail(productUrl: string, listingInfo?: any): Promise<any> {
    const res = await fetch(productUrl, { headers: HEADERS });
    const html = await res.text();

    // URL'den slug çıkar
    const slug = productUrl.split('/urun/')[1] || '';

    // JSON-LD Product verisini çek
    let productData: any = null;
    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let jmatch;
    while ((jmatch = jsonLdRegex.exec(html)) !== null) {
        try {
            const data = JSON.parse(jmatch[1]);
            if (data['@type'] === 'Product') {
                productData = data;
                break;
            }
        } catch (e) { /* parse hatası */ }
    }

    // Ürün adı
    const name = productData?.name || listingInfo?.name || '';

    // Marka
    const brandName = productData?.brand?.name || '';

    // SKU
    const sku = productData?.sku || slug;

    // Açıklama
    const description = productData?.description || listingInfo?.description || '';

    // Fiyat (Karaca fiyatı TL cinsinden tam sayı olarak veriyor, kuruş yok)
    let price = 0;
    let regularPrice = 0;
    
    if (productData?.offers) {
        const offers = productData.offers;
        const offerData = Array.isArray(offers) ? offers[0] : offers;
        price = parseInt(offerData?.price || '0');
    }

    // HTML'den normal/indirimli fiyatları çek
    // Eski fiyat (üzeri çizili)
    const oldPriceMatch = html.match(/product-old-price[^>]*>[\s]*([0-9.,]+)/i) ||
        html.match(/old-price[^>]*>[\s]*([0-9.,]+)/i) ||
        html.match(/line-through[^>]*>[\s]*([0-9.,]+)/i);
    if (oldPriceMatch) {
        const parsed = parseInt(oldPriceMatch[1].replace(/\./g, '').replace(',', '.'));
        if (!isNaN(parsed) && parsed > 0) regularPrice = parsed;
    }

    // İndirimli fiyat
    const salePriceMatch = html.match(/product-price-amount[^>]*>[\s]*([0-9.,]+)/i) ||
        html.match(/sale-price[^>]*>[\s]*([0-9.,]+)/i);
    if (salePriceMatch) {
        const parsed = parseInt(salePriceMatch[1].replace(/\./g, '').replace(',', '.'));
        if (!isNaN(parsed) && parsed > 0) price = parsed;
    }

    if (regularPrice === 0) regularPrice = price;
    if (price === 0 && listingInfo?.price) price = parseInt(listingInfo.price);
    if (regularPrice === 0) regularPrice = price;

    // Kuruş cinsine çevir (100 ile çarp)
    const priceKurus = price * 100;
    const regularPriceKurus = regularPrice * 100;

    // Stok durumu
    let inStock = true;
    if (productData?.offers) {
        const offers = productData.offers;
        const offerData = Array.isArray(offers) ? offers[0] : offers;
        const availability = offerData?.availability || '';
        inStock = !availability.toLowerCase().includes('outofstock');
    }

    // İndirim badge
    let discountBadge: string | null = null;
    if (regularPrice > price && price > 0) {
        const discount = Math.round(((regularPrice - price) / regularPrice) * 100);
        discountBadge = `%${discount}`;
    }

    // Rating & Review
    const rating = parseFloat(productData?.aggregateRating?.ratingValue || listingInfo?.rating || '0');
    const reviewCount = parseInt(productData?.aggregateRating?.reviewCount || listingInfo?.reviewCount || '0');

    // Favori sayısı - HTML'den çek
    let favoriteCount = '';
    const favMatch = html.match(/(\d+[\.,]?\d*[BK]?)\s*kişi\s*favoriledi/i);
    if (favMatch) favoriteCount = favMatch[1];

    // ---- RESİMLERİ ÇEK ----
    // Ürün slug'ını kullanarak CDN resimlerini filtrele
    // Detay sayfasındaki tüm CDN resimlerini çek
    const cdnRegex = /https:\/\/cdn\.karaca\.com\/[^"'\s)\\]+\.(?:jpg|jpeg|png|webp)/gi;
    const allCdnImages: string[] = [];
    let imgMatch;
    while ((imgMatch = cdnRegex.exec(html)) !== null) {
        allCdnImages.push(imgMatch[0]);
    }

    // Ürüne ait resimleri filtrele (slug ile eşleşen)
    // Ayrıca boyut olarak büyük olanları tercih et (cw695 veya cw1390)
    const productImages: string[] = [];
    const seenImageBase = new Set<string>();

    for (const img of allCdnImages) {
        // Ürün slug'ına ait resim mi kontrol et
        if (img.includes(slug) || (sku && img.includes(sku))) {
            // Resim boyutunu normalize et - en büyük boyutu al
            const baseImg = img
                .replace(/cw\d+h\d+q\d+gm/, 'cw695h695q90gm');
            
            if (!seenImageBase.has(baseImg)) {
                seenImageBase.add(baseImg);
                productImages.push(baseImg);
            }
        }
    }

    // Eğer slug ile bulamadıysak, data-productid ile dene
    if (productImages.length === 0) {
        // Product ID'yi bul
        const productIdMatch = html.match(/data-productid="(\d+)"/i) ||
            html.match(/productId['":\s]*['"]?(\d+)/i);
        const productId = productIdMatch ? productIdMatch[1] : '';

        if (productId) {
            for (const img of allCdnImages) {
                if (img.includes(productId) || img.includes(slug.substring(0, 20))) {
                    const baseImg = img.replace(/cw\d+h\d+q\d+gm/, 'cw695h695q90gm');
                    if (!seenImageBase.has(baseImg)) {
                        seenImageBase.add(baseImg);
                        productImages.push(baseImg);
                    }
                }
            }
        }
    }

    // JSON-LD'den de resimleri ekle
    if (productImages.length === 0 && productData?.image) {
        const jsonImages = Array.isArray(productData.image) ? productData.image : [productData.image];
        for (const img of jsonImages) {
            const imgUrl = typeof img === 'string' ? img : img.contentUrl || img.url || '';
            if (imgUrl && !imgUrl.includes('banner')) {
                const baseImg = imgUrl.replace(/cw\d+h\d+q\d+gm/, 'cw695h695q90gm');
                if (!seenImageBase.has(baseImg)) {
                    seenImageBase.add(baseImg);
                    productImages.push(baseImg);
                }
            }
        }
    }

    // Listing'den de resimleri ekle (yedek)
    if (productImages.length === 0 && listingInfo?.images) {
        for (const img of listingInfo.images) {
            if (!img.includes('banner')) {
                const baseImg = img.replace(/cw\d+h\d+q\d+gm/, 'cw695h695q90gm');
                if (!seenImageBase.has(baseImg)) {
                    seenImageBase.add(baseImg);
                    productImages.push(baseImg);
                }
            }
        }
    }

    // Banner olmayan sadece ürün resimlerini al (ilk 4)
    const filteredImages = productImages
        .filter(img => !img.includes('banner') && !img.includes('icon') && !img.includes('logo'))
        .slice(0, 4);

    return {
        name,
        sku,
        slug,
        description,
        price: priceKurus,
        regularPrice: regularPriceKurus,
        brandName,
        imageUrl: filteredImages.join(','), // virgülle ayrılmış ilk 4 resim
        images: filteredImages,
        inStock,
        discountBadge,
        rating,
        reviewCount,
        favoriteCount,
        productUrl,
        jsonData: { productData, rating, reviewCount, favoriteCount, productUrl }
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url, categoryName } = body;

        if (!url) {
            return NextResponse.json({ success: false, error: 'URL gerekli' }, { status: 400 });
        }

        const encoder = new TextEncoder();
        const stream = new TransformStream();
        const writer = stream.writable.getWriter();

        (async () => {
            try {
                await writer.write(encoder.encode(JSON.stringify({ type: 'status', message: 'Kategori sayfası okunuyor...' }) + '\n'));

                const { urls: productUrls, listingData } = await getProductsFromListing(url);
                const totalProducts = Math.min(productUrls.length, 50);

                await writer.write(encoder.encode(JSON.stringify({
                    type: 'status',
                    message: `${productUrls.length} ürün bulundu. İlk ${totalProducts} ürün işlenecek...`
                }) + '\n'));

                if (totalProducts === 0) {
                    await writer.write(encoder.encode(JSON.stringify({
                        type: 'fatal',
                        message: 'Sayfada ürün bulunamadı! URL\'yi kontrol edin.'
                    }) + '\n'));
                    await writer.close();
                    return;
                }

                let savedCount = 0;
                let errorCount = 0;

                for (let i = 0; i < totalProducts; i++) {
                    const productUrl = productUrls[i];
                    try {
                        await writer.write(encoder.encode(JSON.stringify({
                            type: 'progress',
                            current: i + 1,
                            total: totalProducts,
                            message: `Ürün ${i + 1}/${totalProducts} işleniyor...`,
                            url: productUrl
                        }) + '\n'));

                        // Listing'den eşleşen veriyi bul
                        const productSlug = productUrl.split('/urun/')[1] || '';
                        let listingInfo: any = undefined;
                        
                        // listingData'dan en uygun eşleşmeyi bul
                        for (const [key, val] of listingData.entries()) {
                            if (productSlug.includes(key.substring(0, 20)) || key.includes(productSlug.substring(0, 20))) {
                                listingInfo = val;
                                break;
                            }
                        }

                        const product = await scrapeProductDetail(productUrl, listingInfo);

                        // Veritabanına kaydet
                        await pool.query(`
                            INSERT INTO products (sku, name, slug, description, price, regular_price, brand_name, category_name, image_url, images, in_stock, discount_badge, json_data)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                                discount_badge = VALUES(discount_badge),
                                json_data = VALUES(json_data),
                                updated_at = CURRENT_TIMESTAMP
                        `, [
                            product.sku,
                            product.name,
                            product.slug,
                            product.description,
                            product.price,
                            product.regularPrice,
                            product.brandName,
                            categoryName || 'Genel',
                            product.imageUrl,
                            JSON.stringify(product.images),
                            product.inStock,
                            product.discountBadge,
                            JSON.stringify(product.jsonData)
                        ]);

                        savedCount++;

                        await writer.write(encoder.encode(JSON.stringify({
                            type: 'saved',
                            current: i + 1,
                            total: totalProducts,
                            product: {
                                name: product.name,
                                price: product.price,
                                imageUrl: product.imageUrl,
                                images: product.images,
                                rating: product.rating,
                                reviewCount: product.reviewCount,
                                favoriteCount: product.favoriteCount,
                            }
                        }) + '\n'));

                        // Rate limiting
                        await new Promise(r => setTimeout(r, 600));

                    } catch (err: any) {
                        errorCount++;
                        await writer.write(encoder.encode(JSON.stringify({
                            type: 'error',
                            current: i + 1,
                            total: totalProducts,
                            message: `Hata: ${err.message}`,
                            url: productUrl
                        }) + '\n'));
                    }
                }

                await writer.write(encoder.encode(JSON.stringify({
                    type: 'complete',
                    savedCount,
                    errorCount,
                    message: `İşlem tamamlandı! ${savedCount} ürün kaydedildi, ${errorCount} hata oluştu.`
                }) + '\n'));

            } catch (err: any) {
                await writer.write(encoder.encode(JSON.stringify({
                    type: 'fatal',
                    message: `Kritik hata: ${err.message}`
                }) + '\n'));
            } finally {
                await writer.close();
            }
        })();

        return new Response(stream.readable, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            }
        });

    } catch (error: any) {
        console.error('Scrape hatası:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
