"use client";

import Link from "next/link";
import { X, ChevronRight, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/lib/store";

const MENU_CATEGORIES = [
    { name: "Yemek Takımları", slug: "yemek-takimlari" },
    { name: "Tencere Seti", slug: "tencere-seti" },
    { name: "Ev Tekstili", slug: "ev-tekstili" },
    { name: "Küçük Ev Aletleri", slug: "kucuk-ev-aletleri" },
    { name: "Mutfak Tekstili", slug: "mutfak-tekstili" },
];

const NAVY = "#003da5";
const DARK_NAVY = "#0d2366";
const RED = "#e50019";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isOrderTrackOpen, setIsOrderTrackOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const items = useCartStore((state) => state.items);
    const cartCount = items.reduce((total, item) => total + item.amount, 0);
    const cartTotal = items.reduce((total, item) => total + ((item.product?.price ?? 0) * item.amount), 0);

    useEffect(() => {
        document.body.style.overflow = (isMenuOpen || isOrderTrackOpen) ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isMenuOpen, isOrderTrackOpen]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.floor(price / 100));

    return (
        <>
            <header
                className="sticky top-0 z-50"
                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
                {/* ═══════════════════════════════════════════════════
                    ROW 1 — Beyaz zemin
                    ≡  |  Carrefour (C) SA  |  🎧  |  [Sipariş Takip]
                ═══════════════════════════════════════════════════ */}
                <div 
                    className="header-row-1"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#fff",
                        padding: "10px 14px",
                        gap: "12px",
                    }}
                >
                    {/* ≡ Hamburger — mavi 3 çizgi */}
                    <button
                        aria-label="Menü"
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px 2px",
                            flexShrink: 0,
                        }}
                    >
                        <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                            <rect y="0" width="28" height="3" rx="1.5" fill={NAVY} />
                            <rect y="9" width="28" height="3" rx="1.5" fill={NAVY} />
                            <rect y="18" width="28" height="3" rx="1.5" fill={NAVY} />
                        </svg>
                    </button>

                    {/* Logo — Carrefour (C) SA */}
                    <Link href="/" style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/api/csfour-proxy/staticimage/carrefoursacom-logo.svg"
                            alt="CarrefourSA"
                            className="header-logo"
                            style={{ height: "32px", width: "auto", maxWidth: "150px" }}
                        />
                    </Link>

                    {/* Spacer */}
                    <div style={{ flex: 1 }} />

                    {/* 🎧 Headset — Sizi Dinliyoruz */}
                    <a
                        href="#"
                        aria-label="Sizi Dinliyoruz"
                        style={{ flexShrink: 0, display: "flex", alignItems: "center" }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/api/csfour-proxy/staticimage/call-center-icon.svg"
                            alt="Sizi Dinliyoruz"
                            className="header-headset"
                            style={{ width: "38px", height: "34px" }}
                        />
                    </a>

                    {/* [Sipariş Takip] — mavi OUTLINE buton, rounded */}
                    <button
                        onClick={() => setIsOrderTrackOpen(true)}
                        className="header-siparis-takip"
                        style={{
                            flexShrink: 0,
                            border: `2px solid ${NAVY}`,
                            backgroundColor: "transparent",
                            color: NAVY,
                            fontSize: "13px",
                            fontWeight: "700",
                            padding: "6px 16px",
                            borderRadius: "6px",
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                            letterSpacing: "0.01em",
                        }}
                    >
                        Sipariş Takip
                    </button>
                </div>

                {/* ═══════════════════════════════════════════════════
                    ROW 2 — Beyaz zemin
                    🔍  [ Ürün Arayın...  ] [Ara]   [🛒 0,00 TL ∨]
                ═══════════════════════════════════════════════════ */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    padding: "4px 14px 10px 14px",
                    gap: "8px",
                }}>
                    {/* 🔍 Büyük mavi büyüteç ikonu */}
                    <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="10.5" cy="10.5" r="7" stroke={NAVY} strokeWidth="2.5" fill="none" />
                            <line x1="15.5" y1="15.5" x2="21" y2="21" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>

                    {/* Gri pill: [ Ürün Arayın...  ][Ara] */}
                    <div style={{
                        display: "flex",
                        alignItems: "stretch",
                        flex: 1,
                        backgroundColor: "#edf0f4",
                        borderRadius: "24px",
                        overflow: "hidden",
                        height: "40px",
                    }}>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Ürün Arayın..."
                            style={{
                                flex: 1,
                                border: "none",
                                outline: "none",
                                fontSize: "14px",
                                color: "#333",
                                padding: "0 16px",
                                background: "transparent",
                                fontFamily: "Arial, sans-serif",
                                minWidth: 0,
                            }}
                        />
                        <button style={{
                            backgroundColor: NAVY,
                            color: "#fff",
                            border: "none",
                            padding: "0 22px",
                            fontSize: "15px",
                            fontWeight: "700",
                            cursor: "pointer",
                            flexShrink: 0,
                            borderRadius: "24px",
                            fontFamily: "Arial, sans-serif",
                        }}>
                            Ara
                        </button>
                    </div>

                    {/* [🛒 0,00 TL ∨] — çerçeveli rounded kutu */}
                    <Link
                        href="/sepetim"
                        style={{
                            flexShrink: 0,
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            border: `1.5px solid #c5cad4`,
                            borderRadius: "6px",
                            padding: "8px 10px",
                            textDecoration: "none",
                        }}
                        aria-label="Sepetim"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/api/csfour-proxy/staticimage/Icon-shopping-cart-blue.png"
                            alt="sepet"
                            style={{ width: "20px", height: "18px", objectFit: "contain" }}
                        />
                        <span style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: NAVY,
                            whiteSpace: "nowrap",
                        }}>
                            {formatPrice(cartTotal)} TL
                        </span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                            <path d="M6 9l6 6 6-6" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {cartCount > 0 && (
                            <span style={{
                                position: "absolute",
                                top: "-6px",
                                right: "-6px",
                                backgroundColor: RED,
                                color: "#fff",
                                fontSize: "10px",
                                fontWeight: "700",
                                borderRadius: "50%",
                                width: "18px",
                                height: "18px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                lineHeight: 1,
                                zIndex: 10,
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>

                {/* ═══════════════════════════════════════════════════
                    ROW 3 — Koyu lacivert
                    403 Ürün          Çok Satanlar ↕  | Filtrele 🔽
                ═══════════════════════════════════════════════════ */}
                <div style={{
                    backgroundColor: DARK_NAVY,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 14px",
                }}>
                    {/* Sol: "403 Ürün" */}
                    <span style={{ color: "#fff", fontSize: "13px", fontWeight: "700" }}>
                        Ürünler
                    </span>

                    {/* Sağ: Çok Satanlar + Filtrele */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {/* Çok Satanlar */}
                        <button style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "none",
                            border: "none",
                            color: "#fff",
                            fontSize: "13px",
                            fontWeight: "500",
                            cursor: "pointer",
                            padding: 0,
                        }}>
                            <span>Çok Satanlar</span>
                            {/* ↕ sort ikonu — orijinale uygun */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M7 4v16m0 0l-3-3m3 3l3-3M17 20V4m0 0l3 3m-3-3l-3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        {/* | ayraç */}
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", lineHeight: 1 }}>|</span>

                        {/* Filtrele */}
                        <button style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "none",
                            border: "none",
                            color: "#fff",
                            fontSize: "13px",
                            fontWeight: "500",
                            cursor: "pointer",
                            padding: 0,
                        }}>
                            <span>Filtrele</span>
                            {/* Filtre/huni ikonu */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M3 4h18l-7 8v5l-4 2V12L3 4z" stroke="white" strokeWidth="2" strokeLinejoin="round" fill="none" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* ═══ SIDE MENU OVERLAY ═══ */}
            {isMenuOpen && (
                <div
                    data-side-overlay
                    style={{
                        position: "fixed",
                        inset: 0,
                        maxWidth: "none",
                        margin: 0,
                        width: "100vw",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        zIndex: 60,
                    }}
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* ═══ SIDE MENU PANEL ═══ */}
            <div
                data-side-panel
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "300px",
                    maxWidth: "300px",
                    margin: 0,
                    backgroundColor: "#fff",
                    zIndex: 70,
                    boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
                    transform: isMenuOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.28s ease-out",
                    display: "flex",
                    flexDirection: "column",
                    fontFamily: "Arial, sans-serif",
                }}
            >
                {/* Panel Header — Lacivert */}
                <div style={{
                    backgroundColor: NAVY,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    flexShrink: 0,
                }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/api/csfour-proxy/staticimage/carrefoursacom-logo.svg"
                        alt="CarrefourSA"
                        style={{ height: "26px", filter: "brightness(0) invert(1)", maxWidth: "150px" }}
                    />
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Kapat"
                        style={{
                            background: "rgba(255,255,255,0.15)",
                            border: "none",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                        }}
                    >
                        <X size={18} color="#fff" />
                    </button>
                </div>

                {/* Giriş Yap */}
                <Link
                    href="/giris"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px 16px",
                        borderBottom: "1px solid #f0f0f0",
                        backgroundColor: "#f8f9fa",
                        textDecoration: "none",
                        flexShrink: 0,
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/api/csfour-proxy/staticimage/user-profile-icon.svg"
                        alt="user"
                        style={{ width: "28px", height: "28px" }}
                    />
                    <div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#222" }}>Giriş Yap</div>
                        <div style={{ fontSize: "11px", color: "#888" }}>Hesabınıza erişin</div>
                    </div>
                </Link>

                {/* Kategoriler */}
                <div style={{ overflowY: "auto", flex: 1 }}>
                    <div style={{
                        padding: "8px 16px 4px",
                        fontSize: "10px",
                        fontWeight: "700",
                        color: "#aaa",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                    }}>
                        Kategoriler
                    </div>
                    {MENU_CATEGORIES.map((cat) => (
                        <Link
                            key={cat.slug}
                            href={`/kategoriler/${cat.slug}`}
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "13px 16px",
                                borderBottom: "1px solid #f3f3f3",
                                textDecoration: "none",
                            }}
                        >
                            <span style={{ fontSize: "14px", color: "#333" }}>{cat.name}</span>
                            <ChevronRight size={16} color="#bbb" />
                        </Link>
                    ))}
                </div>

                {/* Alt — Sepet */}
                <div style={{ borderTop: "1px solid #eee", padding: "4px 0", flexShrink: 0 }}>
                    <Link
                        href="/sepetim"
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px 16px",
                            textDecoration: "none",
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/api/csfour-proxy/staticimage/Icon-shopping-cart-blue.png"
                            alt="sepet"
                            style={{ width: "22px", height: "20px", objectFit: "contain" }}
                        />
                        <span style={{ fontSize: "14px", color: "#333", fontWeight: "500" }}>Sepetim</span>
                        {cartCount > 0 && (
                            <span style={{
                                marginLeft: "auto",
                                backgroundColor: NAVY,
                                color: "#fff",
                                fontSize: "11px",
                                fontWeight: "700",
                                padding: "2px 8px",
                                borderRadius: "10px",
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* ═══ SİPARİŞ TAKİP POPUP ═══ */}
            {isOrderTrackOpen && (
                <>
                    {/* Overlay */}
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            backgroundColor: "rgba(0,0,0,0.55)",
                            zIndex: 80,
                            maxWidth: "none",
                            margin: 0,
                            width: "100vw",
                        }}
                        onClick={() => setIsOrderTrackOpen(false)}
                    />
                    {/* Modal */}
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            backgroundColor: "#fff",
                            borderRadius: "12px",
                            width: "calc(100% - 40px)",
                            maxWidth: "380px",
                            zIndex: 81,
                            padding: "24px 22px 28px",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
                            fontFamily: "Arial, sans-serif",
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111", margin: 0 }}>
                                Sipariş Takibi
                            </h2>
                            <button
                                onClick={() => setIsOrderTrackOpen(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "4px",
                                    fontSize: "20px",
                                    color: "#666",
                                    lineHeight: 1,
                                }}
                                aria-label="Kapat"
                            >
                                ×
                            </button>
                        </div>

                        {/* Açıklama */}
                        <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.5, margin: "0 0 20px 0" }}>
                            Siparişinizi takip edebilmek için lütfen sipariş numaranızı giriniz.
                        </p>

                        {/* Telefon Numarası */}
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#222", marginBottom: "6px" }}>
                                Telefon Numarası
                            </label>
                            <input
                                type="tel"
                                placeholder="5__ __ _ _"
                                maxLength={11}
                                style={{
                                    width: "100%",
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    padding: "12px 14px",
                                    fontSize: "14px",
                                    color: "#333",
                                    outline: "none",
                                    fontFamily: "Arial, sans-serif",
                                    boxSizing: "border-box",
                                }}
                                onFocus={(e) => e.target.style.borderColor = NAVY}
                                onBlur={(e) => e.target.style.borderColor = "#ddd"}
                            />
                        </div>

                        {/* Sipariş Numaranız */}
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#222", marginBottom: "6px" }}>
                                Sipariş Numaranız
                            </label>
                            <input
                                type="text"
                                placeholder="_ _ _ _ _ _"
                                style={{
                                    width: "100%",
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    padding: "12px 14px",
                                    fontSize: "14px",
                                    color: "#333",
                                    outline: "none",
                                    fontFamily: "Arial, sans-serif",
                                    boxSizing: "border-box",
                                }}
                                onFocus={(e) => e.target.style.borderColor = NAVY}
                                onBlur={(e) => e.target.style.borderColor = "#ddd"}
                            />
                        </div>

                        {/* Devam Butonu */}
                        <button
                            style={{
                                width: "100%",
                                backgroundColor: NAVY,
                                color: "#fff",
                                border: "none",
                                borderRadius: "24px",
                                padding: "14px 0",
                                fontSize: "15px",
                                fontWeight: "700",
                                cursor: "pointer",
                                fontFamily: "Arial, sans-serif",
                            }}
                        >
                            Devam
                        </button>
                    </div>
                </>
            )}
        </>
    );
}
