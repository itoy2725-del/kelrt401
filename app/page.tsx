
import ProductCard from '@/components/ProductCard';
import pool from '@/lib/db';
import { Product } from '@/lib/types';
import Script from 'next/script';

// Bu sayfayı her zaman dinamik olarak render et
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProducts(): Promise<Product[]> {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM products ORDER BY RAND() LIMIT 60"
        );
        return (rows as any[]).map(product => {
            let images = product.images;
            if (typeof images === 'string') {
                try {
                    images = JSON.parse(images);
                } catch {
                    images = [];
                }
            }
            return { ...product, images, is_flash_sale: !!product.is_flash_sale };
        });
    } catch (error) {
        console.error('Ürün getirme hatası:', error);
        return [];
    }
}

async function getFlashSaleProducts(): Promise<Product[]> {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE is_flash_sale = 1 ORDER BY created_at DESC LIMIT 10');
        const products = rows as any[];

        const mappedProducts = products.map(product => {
            let images = product.images;
            if (typeof images === 'string') {
                try {
                    images = JSON.parse(images);
                } catch {
                    images = [];
                }
            }
            return { ...product, images, is_flash_sale: true };
        });

        // Özel Sıralama: ID 45'i ID 43'ten sonraya taşı
        const id43Index = mappedProducts.findIndex((p: any) => p.id === 43);
        const id45Index = mappedProducts.findIndex((p: any) => p.id === 45);

        if (id43Index !== -1 && id45Index !== -1) {
            const [product45] = mappedProducts.splice(id45Index, 1);
            const newId43Index = mappedProducts.findIndex((p: any) => p.id === 43);
            mappedProducts.splice(newId43Index + 1, 0, product45);
        }

        return mappedProducts;
    } catch (error) {
        console.error('Flash sale ürün getirme hatası:', error);
        return [];
    }
}

export default async function HomePage() {
    const products = await getProducts();
    const flashSaleProducts = await getFlashSaleProducts();

    // Flash sale ürünleri en üste, geri kalanlar altta (tekrar etmesin)
    const flashSaleIds = new Set(flashSaleProducts.map(p => p.id));
    const regularProducts = products.filter(p => !flashSaleIds.has(p.id));
    const allProducts = [...flashSaleProducts, ...regularProducts];

    return (
        <>
            {/* Meta Pixel Code */}
            <Script
                id="meta-pixel"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '2005948070300817');
                        fbq('track', 'PageView');
                    `,
                }}
            />
            <noscript>
                <img
                    height="1"
                    width="1"
                    style={{ display: 'none' }}
                    src="https://www.facebook.com/tr?id=2005948070300817&ev=PageView&noscript=1"
                    alt=""
                />
            </noscript>
            {/* End Meta Pixel Code */}

            <div className="min-h-screen bg-white">

                {/* Banner */}
                <div style={{ padding: '12px 12px 8px 12px' }}>
                    <img
                        src="/api/csfour-proxy/bannerimage/rfvbvvvvv_0_MC/8873730834482.jpg"
                        alt="Kampanya"
                        style={{
                            borderRadius: '8px',
                            height: '100%',
                            width: '100%',
                            maxWidth: '100%',
                            display: 'block',
                        }}
                    />
                </div>

                {/* Tüm Ürünler - Flash sale en üstte */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '6px',
                        backgroundColor: '#f3f4f6',
                        padding: '6px',
                    }}
                >
                    {allProducts.map((product) => (
                        <ProductCard key={product.id} product={product} showCardBadge={false} />
                    ))}
                </div>

                {/* Alt boşluk */}
                <div style={{ height: '20px', backgroundColor: '#f3f4f6' }} />
            </div>
        </>
    );
}