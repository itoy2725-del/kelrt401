'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
    const pathname = usePathname();

    // Sadece anasayfada görünsün
    if (pathname !== '/') return null;

    return (
        <div
            style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                height: "87px",
                display: "flex",
                alignItems: "flex-end",
                filter: "drop-shadow(5px 5px 6px #000)",
                maxWidth: "480px",
                margin: "0 auto",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <nav
                style={{
                    width: "100%",
                    height: "64px",
                    display: "grid",
                    gridTemplateColumns: "45px 45px 71px 45px 45px",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "33px",
                    background: "#fff",
                    position: "relative",
                }}
            >
                {/* Kavisli üst kenar — SVG clip-path */}
                <div
                    style={{
                        left: "50%",
                        right: "50%",
                        transform: "translate(-50%, 2px)",
                        top: "-32px",
                        width: "12em",
                        height: "2.2em",
                        position: "absolute",
                        clipPath: "url(#menu)",
                        willChange: "transform",
                        backgroundColor: "#fff",
                    }}
                />

                {/* Ana Sayfa */}
                <div>
                    <a
                        href="javascript:void(0)"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "7px",
                            textDecoration: "none",
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/api/csfour-proxy/staticimage/home-icon.svg"
                            alt="Ana Sayfa"
                            style={{ width: "25px", height: "25px" }}
                        />
                        <span style={{ fontSize: "8px", color: "#7A869A" }}>Ana Sayfa</span>
                    </a>
                </div>

                {/* Kategoriler */}
                <div>
                    <a
                        href="javascript:void(0)"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "7px",
                            textDecoration: "none",
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/api/csfour-proxy/staticimage/categories-icon.svg"
                            alt="Kategoriler"
                            style={{ width: "25px", height: "25px" }}
                        />
                        <span style={{ fontSize: "8px", color: "#7A869A" }}>Kategoriler</span>
                    </a>
                </div>

                {/* CSA Logo Butonu — ortada, yükseltilmiş */}
                <div style={{ zIndex: 1 }}>
                    <Link
                        href="/sepetim"
                        style={{
                            position: "absolute",
                            top: "-18px",
                            display: "block",
                            textDecoration: "none",
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/api/csfour-proxy/staticimage/csa-app-buton.png"
                            alt="CarrefourSA"
                            width={71}
                            height={71}
                            style={{ display: "block" }}
                        />
                    </Link>
                </div>

                {/* Kampanyalar */}
                <div>
                    <Link
                        href="/kampanyalar"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "7px",
                            textDecoration: "none",
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/api/csfour-proxy/staticimage/campaigns-icon.svg"
                            alt="Kampanyalar"
                            style={{ width: "25px", height: "25px" }}
                        />
                        <span style={{ fontSize: "8px", color: "#7A869A" }}>Kampanyalar</span>
                    </Link>
                </div>

                {/* Profilim */}
                <div>
                    <Link
                        href="/giris"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "7px",
                            textDecoration: "none",
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/api/csfour-proxy/staticimage/my-profile-icon.svg"
                            alt="Profilim"
                            style={{ width: "25px", height: "25px" }}
                        />
                        <span style={{ fontSize: "8px", color: "#7A869A" }}>Profilim</span>
                    </Link>
                </div>
            </nav>

            {/* SVG clip-path tanımı — kavisli üst kenar için */}
            <div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
                <svg viewBox="0 0 202.9 45.5">
                    <clipPath id="menu" clipPathUnits="objectBoundingBox" transform="scale(0.0049285362247413 0.021978021978022)">
                        <path d="M6.7,45.5c5.7,0.1,14.1-0.4,23.3-4c5.7-2.3,9.9-5,18.1-10.5c10.7-7.1,11.8-9.2,20.6-14.3c5-2.9,9.2-5.2,15.2-7
                  c7.1-2.1,13.3-2.3,17.6-2.1c4.2-0.2,10.5,0.1,17.6,2.1c6.1,1.8,10.2,4.1,15.2,7c8.8,5,9.9,7.1,20.6,14.3c8.3,5.5,12.4,8.2,18.1,10.5
                  c9.2,3.6,17.6,4.2,23.3,4H6.7z" />
                    </clipPath>
                </svg>
            </div>
        </div>
    );
}