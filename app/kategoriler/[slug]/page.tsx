'use client';

import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';

// Slug → category_name eşleştirmesi
const categoryMap: Record<string, string> = {
    'yemek-takimlari': 'Yemek Takımları',
    'tencere-seti': 'Tencere Seti',
    'ev-tekstili': 'Ev Tekstili',
    'kucuk-ev-aletleri': 'Küçük Ev Aletleri',
    'mutfak-tekstili': 'Mutfak Tekstili',
};

export default function KategoriDetayPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Slug'dan kategori adını bul
    const categoryName = categoryMap[slug] || slug;

    useEffect(() => {
        // Kategori adını kullanarak API'den ürünleri çek
        fetch(`/api/products?category=${encodeURIComponent(categoryName)}&limit=50`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProducts(data.data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [slug, categoryName]);

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Urbanist', sans-serif" }}>
            {/* Üst Bar */}
            <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center gap-3 border-b border-gray-100">
                <Link href="/" className="p-1">
                    <ArrowLeft size={22} className="text-gray-800" />
                </Link>
                <h1 className="text-base font-bold text-gray-900">{categoryName}</h1>
            </div>

            {/* Ürünler */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-black"></div>
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-2 gap-px bg-gray-100">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-400 text-sm">Bu kategoride ürün bulunamadı.</p>
                </div>
            )}
        </div>
    );
}