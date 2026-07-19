'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';

const NAVY = "#003da5";

export default function SepetimPage() {
    const router = useRouter();
    const { items, getTotalPrice, getItemCount, updateQuantity, removeItem, clearCart } = useCartStore();
    const totalPrice = getTotalPrice();
    const itemCount = getItemCount();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price / 100);
    };

    const getFirstImage = (imageUrl: string) => {
        if (!imageUrl) return '/img/placeholder.png';
        const firstUrl = imageUrl.split(',')[0]?.trim() || '/img/placeholder.png';
        if (firstUrl.includes('images.csfour.com/')) {
            return firstUrl.replace('https://images.csfour.com/', '/api/csfour-proxy/');
        }
        return firstUrl;
    };

    const handleCheckout = () => {
        router.push('/adres');
    };

    // Toplam regular_price hesapla (indirim göstermek için)
    const totalRegularPrice = items.reduce((total, item) => {
        const regPrice = item.product.regular_price && item.product.regular_price > item.product.price
            ? item.product.regular_price
            : item.product.price;
        return total + regPrice * item.amount;
    }, 0);

    const totalDiscount = totalRegularPrice - totalPrice;

    if (items.length === 0) {
        return (
            <div style={{
                minHeight: "100vh",
                backgroundColor: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                fontFamily: "Arial, sans-serif",
            }}>
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>🛒</div>
                <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#222", marginBottom: "8px" }}>Sepetiniz Boş</h2>
                <p style={{ fontSize: "13px", color: "#999", marginBottom: "24px" }}>Hemen alışverişe başlayın!</p>
                <Link
                    href="/"
                    style={{
                        backgroundColor: NAVY,
                        color: "#fff",
                        padding: "12px 32px",
                        borderRadius: "25px",
                        fontWeight: "700",
                        fontSize: "14px",
                        textDecoration: "none",
                    }}
                >
                    Alışverişe Başla
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* Breadcrumb */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                backgroundColor: "#fff",
                fontSize: "13px",
            }}>
                <Link href="/" style={{ textDecoration: "none" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M3 12l9-8 9 8" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5 10v9a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1v-9" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
                <span style={{ color: "#ccc" }}>|</span>
                <span style={{ color: NAVY, fontWeight: "600" }}>Sepetim</span>
            </div>

            {/* Sepeti Temizle */}
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                padding: "8px 14px",
                backgroundColor: "#fff",
                borderBottom: "1px solid #eee",
            }}>
                <button
                    onClick={() => clearCart()}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: NAVY,
                        fontSize: "13px",
                        fontWeight: "600",
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12z" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Sepeti Temizle
                </button>
            </div>

            {/* Ürün Kartları */}
            <div style={{ padding: "8px 10px" }}>
                {items.map((item) => {
                    const firstImage = getFirstImage(item.product.image_url);
                    const hasDiscount = item.product.regular_price && item.product.regular_price > item.product.price;

                    return (
                        <div
                            key={item.id}
                            style={{
                                backgroundColor: "#fff",
                                borderRadius: "8px",
                                border: "1px solid #e8e8e8",
                                padding: "12px",
                                marginBottom: "8px",
                            }}
                        >
                            <div style={{ display: "flex", gap: "10px" }}>
                                {/* Favori */}
                                <div style={{ flexShrink: 0, paddingTop: "2px" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#ccc" strokeWidth="1.5" />
                                    </svg>
                                </div>

                                {/* Ürün Resmi */}
                                <div style={{
                                    position: "relative",
                                    width: "70px",
                                    height: "70px",
                                    flexShrink: 0,
                                }}>
                                    <Image
                                        src={firstImage}
                                        alt={item.product.name}
                                        fill
                                        className="object-contain"
                                    />
                                </div>

                                {/* Bilgi */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        color: "#222",
                                        lineHeight: "1.3",
                                        margin: "0 0 6px 0",
                                    }}>
                                        {item.product.name}
                                    </h3>

                                    {/* CarrefourSA Özel badge */}
                                    <div style={{
                                        display: "inline-block",
                                        backgroundColor: "#ffd541",
                                        borderRadius: "14px",
                                        padding: "2px 10px",
                                        fontSize: "10px",
                                        fontWeight: "700",
                                        color: "#fff",
                                        marginBottom: "6px",
                                    }}>
                                        CarrefourSA Özel
                                    </div>

                                    {/* Fiyat */}
                                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                                        {hasDiscount && (
                                            <span style={{
                                                fontSize: "11px",
                                                color: "#999",
                                                textDecoration: "line-through",
                                            }}>
                                                {formatPrice(item.product.regular_price)} TL
                                            </span>
                                        )}
                                        <span style={{
                                            fontSize: "16px",
                                            fontWeight: "800",
                                            color: "#111",
                                        }}>
                                            {formatPrice(item.product.price)}
                                        </span>
                                        <span style={{
                                            fontSize: "11px",
                                            fontWeight: "600",
                                            color: "#111",
                                        }}>
                                            TL
                                        </span>
                                    </div>
                                </div>

                                {/* Sil butonu */}
                                <button
                                    onClick={() => removeItem(item.product_id)}
                                    style={{
                                        flexShrink: 0,
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "2px",
                                        alignSelf: "flex-start",
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12z" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>

                            {/* Adet kontrolü — sarı çöp + adet + yeşil + */}
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                                marginTop: "10px",
                                paddingLeft: "28px",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <button
                                        onClick={() => item.amount === 1
                                            ? removeItem(item.product_id)
                                            : updateQuantity(item.product_id, item.amount - 1)
                                        }
                                        style={{
                                            width: "28px",
                                            height: "28px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "#ffd541",
                                            border: "none",
                                            borderRadius: "50%",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <svg width="12" height="14" viewBox="0 0 24 24" fill="none">
                                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>
                                        {item.amount} <span style={{ fontWeight: "400", color: "#888" }}>adet</span>
                                    </span>
                                    <button
                                        onClick={() => {
                                            if (item.amount < 2) {
                                                updateQuantity(item.product_id, item.amount + 1);
                                            }
                                        }}
                                        disabled={item.amount >= 2}
                                        style={{
                                            width: "28px",
                                            height: "28px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: item.amount >= 2 ? "#ccc" : "#45b02a",
                                            border: "none",
                                            borderRadius: "50%",
                                            cursor: item.amount >= 2 ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        <Plus size={14} color="#fff" />
                                    </button>
                                </div>
                                {item.amount >= 2 && (
                                    <div style={{
                                        color: "#e50019",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        marginTop: "2px",
                                    }}>
                                        (Kampanya nedeniyle sepetinize en fazla 2 adet ekleyebilirsiniz)
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Sipariş Özeti */}
            <div style={{
                margin: "8px 10px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e8e8e8",
                overflow: "hidden",
            }}>
                <div style={{ padding: "16px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111", margin: "0 0 14px 0" }}>
                        Sipariş Özeti
                    </h3>

                    {/* Ürün Tutarı */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontSize: "13px", color: "#444" }}>Ürün Tutarı (KDV Dahil)</span>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>
                            {formatPrice(totalRegularPrice)} TL
                        </span>
                    </div>

                    {/* CarrefourSA Özel indirim */}
                    {totalDiscount > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ fontSize: "13px", color: NAVY }}>CarrefourSA Özel</span>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: NAVY }}>
                                - {formatPrice(totalDiscount)} TL
                            </span>
                        </div>
                    )}
                </div>

                {/* TOPLAM + Siparişi Tamamla */}
                <div 
                    className="checkout-container"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "14px 16px",
                        borderTop: "1px solid #eee",
                    }}
                >
                    <div>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "#666", marginBottom: "2px" }}>TOPLAM</div>
                        <div style={{ fontSize: "17px", fontWeight: "800", color: "#111" }}>
                            {formatPrice(totalPrice)} TL
                        </div>
                    </div>
                    <button
                        onClick={handleCheckout}
                        className="checkout-btn"
                        style={{
                            backgroundColor: NAVY,
                            color: "#fff",
                            border: "none",
                            borderRadius: "25px",
                            padding: "12px 28px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                            fontFamily: "Arial, sans-serif",
                            width: "185px",
                            marginBottom: 0,
                        }}
                    >
                        Siparişi<br />Tamamla
                    </button>
                </div>
            </div>

            {/* Ücretsiz Teslimat Banner */}
            <div style={{
                margin: "8px 10px",
                backgroundColor: "#e8f5e3",
                borderRadius: "8px",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
            }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/api/csfour-proxy/staticimage/cargo-free-motorcycle.png"
                    alt="Ücretsiz Teslimat"
                    width={33}
                    height={31}
                    style={{ flexShrink: 0 }}
                />
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#45b02a" }}>
                    Bugün Kargoda ⚡
                </span>
            </div>
        </div>
    );
}