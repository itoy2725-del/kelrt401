export default function Footer() {
    return (
        <footer style={{ backgroundColor: '#252525', padding: '20px 0 0' }}>
            <div style={{ padding: '0 20px' }}>
                {/* Logo */}
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <a href="/" title="Karaca" aria-label="Karaca ana sayfasına git">
                        <img
                            src="https://static.karaca.com/catalog/view/assets/images/logos/karaca.png"
                            alt="Karaca"
                            loading="lazy"
                            width={170}
                            height={38}
                            style={{ filter: 'brightness(0) invert(1)' }}
                        />
                    </a>
                </div>

                {/* App Store Linkleri */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                    <a
                        href="https://app.adjust.com/3nen34?deep_link=karaca%3A%2F%2F&campaign=ios-buton&fallback=https%3A%2F%2Fapps.apple.com%2Fapp%2Fid1547965580%3Fmt%3D8"
                        rel="noopener"
                        title="Karaca, App Store'da"
                        aria-label="Karaca, App Store'da"
                        style={{ flex: 1 }}
                    >
                        <img
                            src="https://cdn.karaca.com/image/banner/karaca/app-download-component/AppStore-2.svg"
                            alt="Karaca, App Store'da"
                            loading="lazy"
                            style={{ height: 'auto', width: '100%' }}
                        />
                    </a>
                    <a
                        href="https://app.adjust.com/3nen34?deep_link=karaca%3A%2F%2F&campaign=android-buton&fallback=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fgl%3DUS%26hl%3Den%26id%3Dnet.btpro.client.karaca"
                        rel="noopener"
                        title="Karaca, Google Play'de"
                        aria-label="Karaca, Google Play'de"
                        style={{ flex: 1 }}
                    >
                        <img
                            src="https://cdn.karaca.com/image/banner/karaca/app-download-component/GooglePlay-2.svg"
                            alt="Karaca, Google Play'de"
                            loading="lazy"
                            style={{ height: 'auto', width: '100%' }}
                        />
                    </a>
                    <a
                        href="https://appgallery.huawei.com/app/C104784009"
                        rel="noopener"
                        title="Karaca, App Gallery'de"
                        aria-label="Karaca, App Gallery'de"
                        style={{ flex: 1 }}
                    >
                        <img
                            src="https://cdn.karaca.com/image/banner/karaca/app-download-component/HuaweiGallery-2.svg"
                            alt="Karaca, App Gallery'de"
                            loading="lazy"
                            style={{ height: 'auto', width: '100%' }}
                        />
                    </a>
                </div>

                {/* Sosyal Medya İkonları */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <a href="https://www.instagram.com/karaca" target="_blank" rel="noopener" title="Instagram" aria-label="Karaca, Instagram'da">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="5" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                    </a>
                    <a href="https://www.tiktok.com/@karaca" target="_blank" rel="noopener" title="TikTok" aria-label="Karaca, TikTok'da">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="#999"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.57 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.33-6.33V9.19a8.16 8.16 0 0 0 4.7 1.5v-3.4a4.85 4.85 0 0 1-.81-.6z" /></svg>
                    </a>
                    <a href="https://www.youtube.com/@KaracaOnline" target="_blank" rel="noopener" title="YouTube" aria-label="Karaca, YouTube'da">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#999" stroke="none" />
                        </svg>
                    </a>
                    <a href="https://twitter.com/karacaonline" target="_blank" rel="noopener" title="Twitter" aria-label="Karaca, Twitter'da">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="#999"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </a>
                    <a href="https://tr.pinterest.com/karacaonline/" target="_blank" rel="noopener" title="Pinterest" aria-label="Karaca, Pinterest'de">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="#999"><path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.37.04-3.4.22-.92 1.4-5.93 1.4-5.93s-.36-.72-.36-1.78c0-1.66.97-2.9 2.17-2.9 1.02 0 1.52.77 1.52 1.7 0 1.03-.66 2.58-1 4.01-.28 1.2.6 2.17 1.78 2.17 2.14 0 3.78-2.26 3.78-5.5 0-2.88-2.07-4.9-5.03-4.9-3.42 0-5.43 2.57-5.43 5.23 0 1.04.4 2.15.9 2.75a.36.36 0 0 1 .08.35c-.09.38-.3 1.2-.34 1.36-.05.22-.18.27-.4.16-1.5-.7-2.43-2.9-2.43-4.66 0-3.78 2.75-7.26 7.93-7.26 4.16 0 7.4 2.97 7.4 6.93 0 4.14-2.6 7.47-6.23 7.47-1.22 0-2.36-.63-2.75-1.38l-.75 2.86c-.27 1.04-1 2.35-1.49 3.15A12 12 0 1 0 12 0z" /></svg>
                    </a>
                    <a href="https://www.linkedin.com/company/karaca" target="_blank" rel="noopener" title="LinkedIn" aria-label="Karaca, LinkedIn'de">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="#999"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    </a>
                    <a href="https://wa.me/908503330330?text=Müşteri%20temsilcisi%20ile%20görüşmek%20istiyorum" target="_blank" rel="noopener" title="WhatsApp" aria-label="Karaca, WhatsApp'ta">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="#999"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                    </a>
                </div>

                {/* AI Bilgi */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '16px', borderTop: '1px solid #333', paddingTop: '12px' }}>
                    <span style={{ color: '#666', fontSize: '11px' }}>
                        Websitesinde kullanılan bazı görseller yapay zekâ (AI) ile üretilmiştir.
                    </span>
                </div>
            </div>
        </footer>
    );
}
