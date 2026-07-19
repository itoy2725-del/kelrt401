'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '@/lib/types';
import { useState } from 'react';
import { useCartStore } from '@/lib/store';

const BLUE = "#085fae";

interface ProductCardProps {
    product: Product;
    showCardBadge?: boolean;
}

export default function ProductCard({ product, showCardBadge = true }: ProductCardProps) {
    const [imgError, setImgError] = useState(false);

    const addItem = useCartStore((state) => state.addItem);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const items = useCartStore((state) => state.items);
    const cartItem = items.find(item => item.product_id === product.id);
    const quantity = cartItem?.amount || 0;

    const formatPriceParts = (price: number) => {
        const val = price / 100;
        const parts = new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(val).split(',');
        return { integer: parts[0], decimal: parts[1] || '00' };
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price / 100);
    };

    const getFirstImage = () => {
        const url = product.image_url || '';
        if (!url) return '';
        const firstUrl = url.split(',')[0]?.trim() || '';
        if (firstUrl.includes('images.csfour.com/')) {
            return firstUrl.replace('https://images.csfour.com/', '/api/csfour-proxy/');
        }
        return firstUrl;
    };

    const imageUrl = getFirstImage();
    const productUrl = product.slug ? `/urun/${product.slug}` : `/urun/${product.id}`;
    const hasDiscount = product.regular_price && product.regular_price > product.price;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
    };

    const handleIncrease = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(product.id, quantity + 1);
    };

    const handleDecrease = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (quantity <= 1) {
            removeItem(product.id);
        } else {
            updateQuantity(product.id, quantity - 1);
        }
    };

    const priceParts = formatPriceParts(product.price);

    return (
        <Link
            href={productUrl}
            style={{
                display: "block",
                textDecoration: "none",
                fontFamily: "Arial, Helvetica, sans-serif",
            }}
        >
            <div style={{
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                height: "100%",
            }}>
                {/* ── Resim ── */}
                <div style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1",
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                }}>
                    {/* Fırsat Ürünü Badge */}
                    {product.is_flash_sale && (
                        <div style={{
                            position: "absolute",
                            top: "8px",
                            left: "0",
                            zIndex: 2,
                            background: "linear-gradient(135deg, #c0000e 0%, #ff2233 100%)",
                            color: "#fff",
                            fontSize: product.stock_limit ? "12px" : "11px",
                            fontWeight: "800",
                            padding: "4px 11px 4px 7px",
                            borderRadius: "0 14px 14px 0",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            boxShadow: product.stock_limit
                                ? "0 0 0 0 rgba(229,0,25,0.7), 0 2px 8px rgba(229, 0, 25, 0.5)"
                                : "0 2px 6px rgba(229, 0, 25, 0.35)",
                            letterSpacing: "0.2px",
                            lineHeight: "1.3",
                            animation: product.stock_limit ? "ribbonShake 2.5s ease-in-out infinite" : undefined,
                        }}>
                            {product.stock_limit ? (
                                <>
                                    <span style={{ fontSize: "13px", lineHeight: 1 }}>🔥</span>
                                    Son {product.stock_limit} Adet
                                </>
                            ) : (
                                <>🔥 Fırsat Ürünü</>
                            )}
                        </div>
                    )}
                    {/* CSS animations */}
                    <style>{`
                        @keyframes ribbonShake {
                            0%, 100% { transform: translateX(0) scale(1); box-shadow: 0 0 0 0 rgba(229,0,25,0.7), 0 2px 8px rgba(229,0,25,0.5); }
                            10% { transform: translateX(-2px) scale(1.03); }
                            20% { transform: translateX(2px) scale(1.03); }
                            30% { transform: translateX(-1px); }
                            40% { transform: translateX(1px); }
                            50% { transform: translateX(0); box-shadow: 0 0 0 8px rgba(229,0,25,0), 0 2px 8px rgba(229,0,25,0.5); }
                            100% { box-shadow: 0 0 0 0 rgba(229,0,25,0), 0 2px 8px rgba(229,0,25,0.5); }
                        }
                    `}</style>
                    {imageUrl && !imgError ? (
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-contain"
                            style={{ padding: "14px" }}
                            onError={() => setImgError(true)}
                            sizes="(max-width: 768px) 50vw, 200px"
                        />
                    ) : (
                        <div style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ccc",
                            fontSize: "11px",
                            textAlign: "center",
                            padding: "16px",
                            backgroundColor: "#fafafa",
                        }}>
                            <span>{product.name.substring(0, 40)}</span>
                        </div>
                    )}
                </div>

                {/* ── Bilgiler ── */}
                <div style={{
                    padding: "6px 10px 10px",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    alignItems: "center",
                    textAlign: "center",
                }}>
                    {/* Ürün Adı */}
                    <h3 style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#111",
                        lineHeight: "1.3",
                        margin: "0 0 8px 0",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "34px",
                    }}>
                        {product.name}
                    </h3>

                    {/* CarrefourSA Özel — altın sarısı #ffd541 badge */}
                    {showCardBadge && (
                        <div style={{
                            backgroundColor: "#ffd541",
                            borderRadius: "14px",
                            padding: "3px 12px",
                            fontSize: "10px",
                            fontWeight: "700",
                            color: "#fff",
                            marginBottom: "8px",
                            whiteSpace: "nowrap",
                        }}>
                            CarrefourSA Özel
                        </div>
                    )}

                    {/* Fiyat */}
                    <div style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "4px",
                        marginBottom: "10px",
                        justifyContent: "center",
                        flexWrap: "wrap",
                    }}>
                        {hasDiscount && (
                            <span style={{
                                fontSize: "11px",
                                color: "#999",
                                textDecoration: "line-through",
                                whiteSpace: "nowrap",
                            }}>
                                {formatPrice(product.regular_price)} TL
                            </span>
                        )}
                        {/* Ana fiyat — büyük bold siyah */}
                        <span style={{ whiteSpace: "nowrap" }}>
                            <span style={{
                                fontSize: "18px",
                                fontWeight: "800",
                                color: "#111",
                            }}>
                                {priceParts.integer}
                            </span>
                            <span style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#111",
                            }}>
                                ,{priceParts.decimal} TL
                            </span>
                        </span>
                    </div>

                    {/* Sepete Ekle — dolgulu mavi pill */}
                    <div style={{ marginTop: "auto" }}>
                        {quantity === 0 ? (
                            <button
                                id={`add-to-cart-${product.id}`}
                                onClick={handleAddToCart}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "5px",
                                    backgroundColor: BLUE,
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "25px",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    padding: "7px 14px",
                                    cursor: "pointer",
                                    fontFamily: "Arial, sans-serif",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <ShoppingCart size={14} />
                                Sepete Ekle
                            </button>
                        ) : (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                            }}>
                                {/* Sarı çöp kutusu (sil/azalt) */}
                                <button
                                    onClick={handleDecrease}
                                    style={{
                                        width: "30px",
                                        height: "30px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#ffd541",
                                        border: "none",
                                        borderRadius: "50%",
                                        cursor: "pointer",
                                    }}
                                    aria-label="Azalt"
                                >
                                    <svg width="14" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                {/* Adet yazısı */}
                                <span style={{
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    color: "#333",
                                }}>
                                    {quantity} <span style={{ fontWeight: "400", color: "#888" }}>adet</span>
                                </span>
                                {/* Yeşil + butonu */}
                                <button
                                    onClick={handleIncrease}
                                    style={{
                                        width: "30px",
                                        height: "30px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#45b02a",
                                        border: "none",
                                        borderRadius: "50%",
                                        cursor: "pointer",
                                    }}
                                    aria-label="Artır"
                                >
                                    <Plus size={16} color="#fff" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
