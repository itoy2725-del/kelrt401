'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Heart, Star, ChevronRight } from 'lucide-react';
import { Product } from '@/lib/types';

interface FlashDealsProps {
    products: Product[];
    isVerticalList?: boolean;
}

export default function FlashDeals({ products, isVerticalList = false }: FlashDealsProps) {
    const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 19, seconds: 10 });

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
                    return prev;
                }
                
                let h = prev.hours;
                let m = prev.minutes;
                let s = prev.seconds - 1;
                
                if (s < 0) {
                    s = 59;
                    m -= 1;
                }
                if (m < 0) {
                    m = 59;
                    h -= 1;
                }
                
                return { hours: h, minutes: m, seconds: s };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price / 100);
    };

    // image_url virgülle ayrılmış olabilir, ilk resmi al
    const getFirstImage = (product: Product) => {
        const url = product.image_url || '';
        if (!url) return '';
        return url.split(',')[0]?.trim() || '';
    };

    // JSON data'dan rating/review/favorite bilgisi
    const getMeta = (product: Product) => {
        if (!product.json_data) return { rating: 0, reviewCount: 0, favoriteCount: '' };
        try {
            const jd = typeof product.json_data === 'string' ? JSON.parse(product.json_data) : product.json_data;
            return {
                rating: parseFloat(jd.rating || jd.productData?.aggregateRating?.ratingValue || '0'),
                reviewCount: parseInt(jd.reviewCount || jd.productData?.aggregateRating?.reviewCount || '0'),
                favoriteCount: jd.favoriteCount || '',
            };
        } catch {
            return { rating: 0, reviewCount: 0, favoriteCount: '' };
        }
    };

    if (products.length === 0) return null;

    return (
        <div className="pb-4" style={{ fontFamily: "'Urbanist', sans-serif" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 mb-3">
                <div className="flex items-center gap-2">
                    <h2 className={`text-base font-bold ${isVerticalList ? 'text-black' : 'text-white'}`}>
                        {isVerticalList ? 'Kampanyalı Ürünler' : 'Günün Fırsat Ürünleri 🔥'}
                    </h2>
                </div>
                {!isVerticalList && (
                    <Link href="/kampanyalar" className="text-sm font-semibold text-amber-400 flex items-center gap-0.5">
                        Tümü
                        <ChevronRight size={16} />
                    </Link>
                )}
            </div>

            {/* Timer */}
            {!isVerticalList && (
                <div className="flex items-center gap-2 px-4 mb-3">
                    <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5">
                        <Clock size={14} className="text-amber-400" />
                        <span className="text-white/90 text-xs font-semibold">
                            Kampanya süresinin bitmesine
                        </span>
                        <span className="text-amber-400 font-bold text-xs font-mono">
                            {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                        </span>
                    </div>
                </div>
            )}

            {/* Products Horizontal Scroll or Vertical Grid */}
            <div className={isVerticalList ? "grid grid-cols-2 gap-3 px-4 pb-3" : "flex overflow-x-auto gap-3 px-4 pb-3 scrollbar-hide"}>
                {products.map((product) => {
                    const imageUrl = getFirstImage(product);
                    const meta = getMeta(product);
                    const hasDiscount = product.regular_price && product.regular_price > product.price;
                    const discountPercent = hasDiscount ? Math.round((1 - product.price / product.regular_price) * 100) : 0;
                    const productUrl = product.slug ? `/urun/${product.slug}` : `/urun/${product.id}`;

                    return (
                        <Link
                            key={product.id}
                            href={productUrl}
                            className={`${isVerticalList ? 'w-full' : 'flex-shrink-0 w-[170px]'} bg-white rounded-xl border border-gray-100 overflow-hidden`}
                        >
                            {/* Resim */}
                            <div className="relative w-full aspect-square bg-white">
                                {imageUrl ? (
                                    <Image
                                        src={imageUrl}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-2"
                                        sizes="170px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                        {product.name.substring(0, 30)}
                                    </div>
                                )}

                                {/* Favori */}
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 shadow-sm flex items-center justify-center z-10"
                                >
                                    <Heart size={14} className="text-gray-400" />
                                </button>

                                {/* Ücretsiz Kargo badge */}
                                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                                    <span className="bg-green-600 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-sm">
                                        Ücretsiz Kargo
                                    </span>
                                    {/* Son X Adet ribbon — sadece stock_limit varsa */}
                                    {product.stock_limit && (
                                        <span style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            background: "linear-gradient(135deg, #c0000e 0%, #ff2233 100%)",
                                            color: "#fff",
                                            fontSize: "12px",
                                            fontWeight: "800",
                                            padding: "3px 8px",
                                            borderRadius: "4px",
                                            boxShadow: "0 0 0 0 rgba(229,0,25,0.7), 0 2px 8px rgba(229,0,25,0.5)",
                                            letterSpacing: "0.1px",
                                            whiteSpace: "nowrap",
                                            animation: "ribbonShake 2.5s ease-in-out infinite",
                                        }}>
                                            <span style={{ fontSize: "13px", lineHeight: 1 }}>🔥</span>
                                            Son {product.stock_limit} Adet
                                        </span>
                                    )}
                                </div>
                                {/* Animation keyframes */}
                                <style>{`
                                    @keyframes ribbonShake {
                                        0%, 100% { transform: translateX(0) scale(1); box-shadow: 0 0 0 0 rgba(229,0,25,0.7), 0 2px 8px rgba(229,0,25,0.5); }
                                        10% { transform: translateX(-2px) scale(1.04); }
                                        20% { transform: translateX(2px) scale(1.04); }
                                        30% { transform: translateX(-1px); }
                                        40% { transform: translateX(1px); }
                                        50% { transform: translateX(0); box-shadow: 0 0 0 8px rgba(229,0,25,0), 0 2px 8px rgba(229,0,25,0.5); }
                                        100% { box-shadow: 0 0 0 0 rgba(229,0,25,0), 0 2px 8px rgba(229,0,25,0.5); }
                                    }
                                `}</style>
                            </div>

                            {/* Bilgiler */}
                            <div className="px-2.5 pb-3 pt-1">
                                {/* Marka */}
                                {product.brand_name && (
                                    <p className="text-[10px] font-bold text-gray-900 uppercase tracking-wide mb-0.5">
                                        {product.brand_name}
                                    </p>
                                )}

                                {/* Ürün Adı */}
                                <h3 className="text-[12px] text-gray-600 line-clamp-2 min-h-[32px] leading-4 mb-1.5">
                                    {product.name}
                                </h3>

                                {/* Rating */}
                                {meta.rating > 0 && (
                                    <div className="flex items-center gap-1 mb-1">
                                        <span className="text-[11px] font-bold text-gray-800">{meta.rating.toFixed(1)}</span>
                                        <div className="flex items-center gap-px">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star
                                                    key={i}
                                                    size={9}
                                                    className={i <= Math.round(meta.rating)
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'fill-gray-200 text-gray-200'
                                                    }
                                                />
                                            ))}
                                        </div>
                                        {meta.reviewCount > 0 && (
                                            <span className="text-[9px] text-gray-400">({meta.reviewCount})</span>
                                        )}
                                    </div>
                                )}

                                {/* İndirim Badge */}
                                {hasDiscount && (
                                    <div className="flex items-center gap-1 mb-1">
                                        <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                                            Sepette %{discountPercent} ↓
                                        </span>
                                    </div>
                                )}

                                {/* Fiyat */}
                                <div className="flex flex-col">
                                    {hasDiscount && (
                                        <span className="text-[11px] text-gray-400 line-through">
                                            {formatPrice(product.regular_price)} TL
                                        </span>
                                    )}
                                    <span className="text-[15px] font-bold text-gray-900">
                                        {formatPrice(product.price)} TL
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
