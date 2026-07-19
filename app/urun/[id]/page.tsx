'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Minus, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Product } from '@/lib/types';

const BLUE = "#085fae";
const NAVY = "#003da5";
const GOLD = "#ffd541";

export default function UrunDetayPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id;
    const [product, setProduct] = useState<Product | null>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorited, setIsFavorited] = useState(false);
    const [openTab, setOpenTab] = useState<string | null>(null);
    const { addItem, items, updateQuantity } = useCartStore();

    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const cartItem = items.find(item => item.product_id === Number(productId));
    const quantity = cartItem?.amount || 0;

    useEffect(() => {
        fetch(`/api/products/${productId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProduct(data.data);
                    if (data.data.similarProducts) {
                        setSimilarProducts(data.data.similarProducts);
                    } else if (data.data.category_name) {
                        // Fallback
                        fetch(`/api/products?category=${encodeURIComponent(data.data.category_name)}&limit=10`)
                            .then(res => res.json())
                            .then(catData => {
                                if (catData.success) {
                                    const filtered = catData.data
                                        .filter((p: Product) => p.id !== data.data.id)
                                        .slice(0, 8);
                                    setSimilarProducts(filtered);
                                }
                            });
                    }
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [productId]);

    const getProductImages = useCallback((): string[] => {
        if (!product) return [];
        const imageUrl = product.image_url || '';
        if (!imageUrl) return ['/img/placeholder.png'];
        const images = imageUrl.split(',').map(url => {
            const trimmed = url.trim();
            if (trimmed.includes('images.csfour.com/')) {
                return trimmed.replace('https://images.csfour.com/', '/api/csfour-proxy/');
            }
            return trimmed;
        }).filter(url => url.length > 0);
        return images.length > 0 ? images : ['/img/placeholder.png'];
    }, [product]);

    const productImages = getProductImages();

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };
    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        if (diff > 50 && currentImageIndex < productImages.length - 1) setCurrentImageIndex(p => p + 1);
        else if (diff < -50 && currentImageIndex > 0) setCurrentImageIndex(p => p - 1);
    };

    const formatPrice = (price: number) => {
        const whole = Math.floor(price / 100);
        const decimal = (price % 100).toString().padStart(2, '0');
        return { whole: whole.toLocaleString('tr-TR'), decimal };
    };

    const cleanDescription = (html: string) => {
        if (!html) return '';
        let text = html
            .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'").replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ');
        text = text
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n').replace(/<p>/gi, '')
            .replace(/<\/?strong>/gi, '').replace(/<\/?b>/gi, '')
            .replace(/<\/?i>/gi, '').replace(/<\/?em>/gi, '')
            .replace(/<\/?span[^>]*>/gi, '').replace(/<\/?div[^>]*>/gi, '\n')
            .replace(/<[^>]*>/g, '').replace(/\n{3,}/g, '\n\n').trim();
        return text;
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: BLUE, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#fff', fontFamily: 'Arial, sans-serif' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#222', marginBottom: 8 }}>Ürün Bulunamadı</h2>
                <Link href="/" style={{ fontSize: 14, color: BLUE, textDecoration: 'underline' }}>Ana Sayfaya Dön</Link>
            </div>
        );
    }

    const hasDiscount = product.regular_price && product.regular_price > product.price;
    const discountPercent = hasDiscount ? Math.round((1 - product.price / product.regular_price) * 100) : 0;
    const price = formatPrice(product.price);
    const regularPrice = hasDiscount ? formatPrice(product.regular_price) : null;

    return (
        <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: 80, fontFamily: 'Arial, sans-serif' }}>
            {/* Top Bar */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 30, background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderBottom: '1px solid #eee',
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M12 19l-7-7 7-7" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
                <div style={{ display: 'flex', gap: 8 }}>
                    {/* Share */}
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="18" cy="5" r="3" stroke="#333" strokeWidth="1.5" />
                            <circle cx="6" cy="12" r="3" stroke="#333" strokeWidth="1.5" />
                            <circle cx="18" cy="19" r="3" stroke="#333" strokeWidth="1.5" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="#333" strokeWidth="1.5" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="#333" strokeWidth="1.5" />
                        </svg>
                    </button>
                    {/* Favorite */}
                    <button
                        onClick={() => setIsFavorited(!isFavorited)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorited ? '#e50019' : 'none'}>
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                stroke={isFavorited ? '#e50019' : '#333'} strokeWidth="1.5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Image Carousel */}
            <div style={{ position: 'relative', background: '#fff' }}>
                <div
                    style={{ position: 'relative', width: '100%', aspectRatio: '1', overflow: 'hidden' }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div style={{
                        display: 'flex', transition: 'transform 0.3s ease', height: '100%',
                        transform: `translateX(-${currentImageIndex * 100}%)`
                    }}>
                        {productImages.map((img, idx) => (
                            <div key={idx} style={{ width: '100%', height: '100%', flexShrink: 0, position: 'relative' }}>
                                <Image src={img} alt={`${product.name} - ${idx + 1}`} fill className="object-contain" style={{ padding: 24 }} sizes="100vw" priority={idx === 0} />
                            </div>
                        ))}
                    </div>

                    {/* Stock limit ribbon (öncelikli) veya indirim yüzdesi */}
                    {(product.stock_limit || hasDiscount) && (
                        <div style={{
                            position: 'absolute',
                            top: 12,
                            left: 0,
                            zIndex: 2,
                            background: 'linear-gradient(135deg, #c0000e 0%, #ff2233 100%)',
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 800,
                            padding: '5px 13px 5px 8px',
                            borderRadius: '0 16px 16px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            boxShadow: product.stock_limit
                                ? '0 0 0 0 rgba(229,0,25,0.7), 0 3px 10px rgba(229,0,25,0.5)'
                                : '0 3px 8px rgba(229,0,25,0.4)',
                            letterSpacing: '0.2px',
                            lineHeight: '1.3',
                            animation: product.stock_limit ? 'ribbonShake 2.5s ease-in-out infinite' : undefined,
                        }}>
                            {product.stock_limit ? (
                                <>
                                    <span style={{ fontSize: 15, lineHeight: 1 }}>🔥</span>
                                    Son {product.stock_limit} Adet
                                </>
                            ) : (
                                <>{`%${discountPercent}`}</>
                            )}
                        </div>
                    )}
                    <style>{`
                        @keyframes ribbonShake {
                            0%, 100% { transform: translateX(0) scale(1); box-shadow: 0 0 0 0 rgba(229,0,25,0.7), 0 3px 10px rgba(229,0,25,0.5); }
                            10% { transform: translateX(-2px) scale(1.04); }
                            20% { transform: translateX(2px) scale(1.04); }
                            30% { transform: translateX(-1px); }
                            40% { transform: translateX(1px); }
                            50% { transform: translateX(0); box-shadow: 0 0 0 10px rgba(229,0,25,0), 0 3px 10px rgba(229,0,25,0.5); }
                            100% { box-shadow: 0 0 0 0 rgba(229,0,25,0), 0 3px 10px rgba(229,0,25,0.5); }
                        }
                    `}</style>

                    {/* Nav arrows */}
                    {productImages.length > 1 && currentImageIndex > 0 && (
                        <button onClick={() => setCurrentImageIndex(p => p - 1)}
                            style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.8)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.15)', zIndex: 3 }}>
                            <ChevronLeft size={18} color="#333" />
                        </button>
                    )}
                    {productImages.length > 1 && currentImageIndex < productImages.length - 1 && (
                        <button onClick={() => setCurrentImageIndex(p => p + 1)}
                            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.8)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.15)', zIndex: 3 }}>
                            <ChevronRight size={18} color="#333" />
                        </button>
                    )}
                </div>

                {/* Dots */}
                {productImages.length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '10px 0' }}>
                        {productImages.map((_, idx) => (
                            <button key={idx} onClick={() => setCurrentImageIndex(idx)}
                                style={{
                                    width: currentImageIndex === idx ? 20 : 8, height: 8,
                                    borderRadius: 4, border: 'none', cursor: 'pointer',
                                    background: currentImageIndex === idx ? BLUE : '#ddd',
                                    transition: 'all .2s',
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Thumbnail strip */}
                {productImages.length > 1 && (
                    <div style={{ display: 'flex', gap: 8, padding: '0 12px 12px', overflowX: 'auto' }} className="scrollbar-hide">
                        {productImages.map((img, idx) => (
                            <button key={idx} onClick={() => setCurrentImageIndex(idx)}
                                style={{
                                    flexShrink: 0, width: 52, height: 52, borderRadius: 6,
                                    border: `2px solid ${currentImageIndex === idx ? BLUE : '#e5e7eb'}`,
                                    overflow: 'hidden', cursor: 'pointer', background: '#fff', padding: 2,
                                }}>
                                <Image src={img} alt={`Thumb ${idx + 1}`} width={48} height={48} className="object-contain" style={{ width: '100%', height: '100%' }} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div style={{ padding: '14px 14px 0' }}>
                {/* Brand */}
                {product.brand_name && (
                    <p style={{ fontSize: 13, fontWeight: 600, color: BLUE, marginBottom: 4, textTransform: 'uppercase' }}>
                        {product.brand_name}
                    </p>
                )}

                {/* Title */}
                <h1 style={{ fontSize: 15, fontWeight: 600, color: '#222', lineHeight: 1.4, margin: '0 0 10px' }}>
                    {product.name}
                </h1>

                {/* CarrefourSA Özel badge */}
                {hasDiscount && (
                    <div style={{
                        display: 'inline-block', background: GOLD, borderRadius: 14,
                        padding: '3px 12px', fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 10,
                    }}>
                        CarrefourSA Özel
                    </div>
                )}

                {/* Price */}
                <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #eee' }}>
                    {hasDiscount && regularPrice && (
                        <div style={{ fontSize: 13, color: '#999', textDecoration: 'line-through', marginBottom: 4 }}>
                            {regularPrice.whole},{regularPrice.decimal} TL
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                        <span style={{ fontSize: 28, fontWeight: 800, color: '#111' }}>{price.whole}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>,{price.decimal} TL</span>
                        {hasDiscount && (
                            <span style={{
                                marginLeft: 8, fontSize: 11, fontWeight: 700, color: '#e50019',
                                background: '#fce4e4', padding: '2px 6px', borderRadius: 4,
                            }}>
                                %{discountPercent}
                            </span>
                        )}
                    </div>
                </div>

                {/* Delivery Info */}
                <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/api/csfour-proxy/staticimage/cargo-free-motorcycle.png" alt="" width={28} height={24} />
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#45b02a', margin: 0 }}>Ücretsiz Teslimat</p>
                            <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>⚡Aynı Gün Kargo</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <svg width="28" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M1 4v10h10M23 20V10H13" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20.49 9A9 9 0 003.51 15" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#333', margin: 0 }}>14 Gün İade Garantisi</p>
                            <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>Koşulsuz iade imkanı</p>
                        </div>
                    </div>
                </div>

                {/* CarrefourSA Tabs — Accordion */}
                <div style={{ marginBottom: 14 }}>
                    {/* Ürün Bilgileri */}
                    <button
                        onClick={() => setOpenTab(openTab === 'info' ? null : 'info')}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                            background: '#fff', border: 'none', borderBottom: '1px solid #eee',
                            padding: '14px 0', cursor: 'pointer', fontFamily: 'Arial, sans-serif',
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/api/csfour-proxy/bannerimage/UrunBilgi2023_0_MC/8851736068146.png" alt="" width={26} height={26} style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: NAVY, textAlign: 'left' }}>Ürün Bilgileri</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: openTab === 'info' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s', flexShrink: 0 }}>
                            <path d="M6 9l6 6 6-6" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    {openTab === 'info' && (
                        <div style={{ padding: '14px 0 14px 36px', fontSize: 13, color: '#555', lineHeight: 1.7, whiteSpace: 'pre-line', borderBottom: '1px solid #eee' }}>
                            {product.description ? cleanDescription(product.description)
                                : `${product.name} - Orijinal ürün güvencesiyle satışa sunulmaktadır.`}
                        </div>
                    )}

                    {/* Taksit Bilgileri */}
                    <button
                        onClick={() => setOpenTab(openTab === 'installment' ? null : 'installment')}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                            background: '#fff', border: 'none', borderBottom: '1px solid #eee',
                            padding: '14px 0', cursor: 'pointer', fontFamily: 'Arial, sans-serif',
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/api/csfour-proxy/bannerimage/TaksitBilgi2023_0_MC/8851736035378.png" alt="" width={30} height={26} style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: NAVY, textAlign: 'left' }}>Taksit Bilgileri</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: openTab === 'installment' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s', flexShrink: 0 }}>
                            <path d="M6 9l6 6 6-6" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    {openTab === 'installment' && (
                        <div style={{ padding: '14px 0 14px 36px', fontSize: 13, color: '#555', lineHeight: 1.6, borderBottom: '1px solid #eee' }}>
                            <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#333' }}>Taksit Seçenekleri</p>
                            <p style={{ margin: 0 }}>Tüm kredi kartlarına peşin fiyatına 2, 3, 4 taksit imkanı sunulmaktadır. 6 ve 9 taksit seçenekleri vade farklı olarak uygulanabilir. Detaylı bilgi için ödeme adımında taksit seçeneklerini inceleyebilirsiniz.</p>
                        </div>
                    )}

                    {/* İade Süreçleri */}
                    <button
                        onClick={() => setOpenTab(openTab === 'return' ? null : 'return')}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                            background: '#fff', border: 'none', borderBottom: '1px solid #eee',
                            padding: '14px 0', cursor: 'pointer', fontFamily: 'Arial, sans-serif',
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/api/csfour-proxy/bannerimage/Garantiade2023_0_MC/8851735871538.png" alt="" width={30} height={26} style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: NAVY, textAlign: 'left' }}>İade Süreçleri</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: openTab === 'return' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s', flexShrink: 0 }}>
                            <path d="M6 9l6 6 6-6" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    {openTab === 'return' && (
                        <div style={{ padding: '14px 0 14px 36px', fontSize: 13, color: '#555', lineHeight: 1.6, borderBottom: '1px solid #eee' }}>
                            <p style={{ margin: '0 0 6px' }}>Alıcı uygun koşulların sağlanması durumunda 14 (on dört) gün içinde, 444 1000&apos;i arayarak Müşteri Hizmetlerinden iade sürecini başlatabilir.</p>
                            <p style={{ margin: 0 }}>Ürün iade ve değişim süreci hakkında detaylı bilgi için <span style={{ color: BLUE, fontWeight: 600, textDecoration: 'underline' }}>tıklayınız</span></p>
                        </div>
                    )}
                </div>

                {/* Benzer Ürünler */}
                {similarProducts.length > 0 && (
                    <div style={{ marginTop: 4, paddingTop: 14, borderTop: '1px solid #eee' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#222', marginBottom: 12 }}>Benzer Ürünler</h3>
                        <div style={{ display: 'flex', overflowX: 'auto', gap: 10, paddingBottom: 12, marginLeft: -14, paddingLeft: 14, marginRight: -14, paddingRight: 14 }} className="scrollbar-hide">
                            {similarProducts.map((sp) => {
                                const spImgRaw = (sp.image_url || '').split(',')[0]?.trim() || '/img/placeholder.png';
                                const spImg = spImgRaw.includes('images.csfour.com/')
                                    ? spImgRaw.replace('https://images.csfour.com/', '/api/csfour-proxy/')
                                    : spImgRaw;
                                const spHasDiscount = sp.regular_price > sp.price;
                                const spDiscount = spHasDiscount ? Math.round((1 - sp.price / sp.regular_price) * 100) : 0;
                                const spPrice = formatPrice(sp.price);

                                return (
                                    <Link key={sp.id} href={`/urun/${sp.id}`} style={{ flexShrink: 0, width: 140, textDecoration: 'none' }}>
                                        <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                                            <div style={{ position: 'relative', aspectRatio: '1', background: '#fafafa' }}>
                                                <Image src={spImg} alt={sp.name} fill className="object-contain" style={{ padding: 8 }} sizes="140px" />
                                                {spHasDiscount && (
                                                    <div style={{ position: 'absolute', top: 6, left: 6, background: '#e50019', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3 }}>
                                                        %{spDiscount}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ padding: '8px 8px 10px' }}>
                                                <h4 style={{ fontSize: 11, fontWeight: 500, color: '#333', lineHeight: 1.3, height: 28, overflow: 'hidden', margin: 0 }}>
                                                    {sp.name}
                                                </h4>
                                                <div style={{ marginTop: 6 }}>
                                                    {spHasDiscount && (
                                                        <span style={{ fontSize: 10, color: '#999', textDecoration: 'line-through', display: 'block' }}>
                                                            {formatPrice(sp.regular_price).whole},{formatPrice(sp.regular_price).decimal} TL
                                                        </span>
                                                    )}
                                                    <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>
                                                        {spPrice.whole},<span style={{ fontSize: 11 }}>{spPrice.decimal}</span> TL
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed Bottom Bar */}
            <div 
                className="product-bottom-bar"
                style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
                    background: '#fff', borderTop: '1px solid #eee',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', maxWidth: 480, margin: '0 auto',
                }}
            >
                {/* Price */}
                <div>
                    {hasDiscount && regularPrice && (
                        <span style={{ fontSize: 11, color: '#999', textDecoration: 'line-through', display: 'block' }}>
                            {regularPrice.whole},{regularPrice.decimal} TL
                        </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>{price.whole}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>,{price.decimal} TL</span>
                    </div>
                </div>

                {/* Sepete Ekle / Adet Kontrol */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    {quantity > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button
                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                style={{
                                    width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: GOLD, border: 'none', borderRadius: '50%', cursor: 'pointer',
                                }}>
                                {quantity === 1 ? (
                                    <svg width="14" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <Minus size={16} color="#fff" />
                                )}
                            </button>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#333', minWidth: 20, textAlign: 'center' }}>
                                {quantity} <span style={{ fontWeight: 400, color: '#888', fontSize: 13 }}>adet</span>
                            </span>
                            <button
                                onClick={() => {
                                    if (quantity < 2) {
                                        updateQuantity(product.id, quantity + 1);
                                    }
                                }}
                                disabled={quantity >= 2}
                                style={{
                                    width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: quantity >= 2 ? '#ccc' : '#45b02a', border: 'none', borderRadius: '50%',
                                    cursor: quantity >= 2 ? 'not-allowed' : 'pointer',
                                }}>
                                <Plus size={16} color="#fff" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => { addItem(product); router.push('/sepetim'); }}
                            className="product-buy-btn"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                backgroundColor: BLUE, color: '#fff', border: 'none', borderRadius: 25,
                                fontSize: 14, fontWeight: 700, padding: '12px 24px', cursor: 'pointer',
                                fontFamily: 'Arial, sans-serif',
                            }}
                        >
                            <ShoppingCart size={18} />
                            Sepete Ekle
                        </button>
                    )}
                    {quantity >= 2 && (
                        <span style={{ color: '#e50019', fontSize: '9px', fontWeight: '600', textAlign: 'right' }}>
                            (En fazla 2 adet ekleyebilirsiniz)
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
