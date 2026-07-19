'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, X, ChevronDown, ChevronUp, AlertCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import locationData from '@/app/data.json';

interface Ilce {
    plaka_kodu: string;
    ilce_kodu: string;
    il_adi: string;
    ilce_adi: string;
}

interface Il {
    il_adi: string;
    plaka_kodu: string;
    ilceler: Ilce[];
}

interface LocationData {
    data: Il[];
}

// Türkçe büyük/küçük harf duyarsız karşılaştırma (i/İ sorunu dahil)
function trNormalize(str: string): string {
    return str
        // Büyük harfleri ÖNCE replace et (toLowerCase önce çalışırsa İ → i̇ olur, regex tutmaz)
        .replace(/İ/g, 'i')
        .replace(/I/g, 'i')
        .replace(/Ğ/g, 'g')
        .replace(/Ü/g, 'u')
        .replace(/Ş/g, 's')
        .replace(/Ö/g, 'o')
        .replace(/Ç/g, 'c')
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
}

function trIncludes(haystack: string, needle: string): boolean {
    return trNormalize(haystack).includes(trNormalize(needle));
}

export default function YeniAdresPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    // Form state — title otomatik olarak "Ev" set edilecek
    const [formData, setFormData] = useState({
        title: 'Ev',
        first_name: '',
        last_name: '',
        phone: '',
        city: '',
        district: '',
        neighborhood: '',
        street: '',
        building_no: '',
        floor_no: '',
        door_no: '',
        address_description: '',
        is_default: true
    });

    // Dropdown data
    const [cities, setCities] = useState<Il[]>([]);
    const [districts, setDistricts] = useState<Ilce[]>([]);

    // Arama filtreleri
    const [citySearch, setCitySearch] = useState('');
    const [districtSearch, setDistrictSearch] = useState('');

    // Dropdown visibility
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

    const citySearchRef = useRef<HTMLInputElement>(null);
    const districtSearchRef = useRef<HTMLInputElement>(null);

    // İlleri yükle
    useEffect(() => {
        try {
            const data = locationData as LocationData;
            if (data.data && Array.isArray(data.data)) {
                const sortedCities = [...data.data].sort((a, b) =>
                    a.il_adi.localeCompare(b.il_adi, 'tr')
                );
                setCities(sortedCities);
            }
        } catch (error) {
            console.error('İller yüklenemedi:', error);
        }
    }, []);

    // İl değişince ilçeleri güncelle
    useEffect(() => {
        if (formData.city && cities.length > 0) {
            const selectedCity = cities.find(c => c.il_adi === formData.city);
            if (selectedCity?.ilceler && Array.isArray(selectedCity.ilceler)) {
                const sortedDistricts = [...selectedCity.ilceler].sort((a, b) =>
                    a.ilce_adi.localeCompare(b.ilce_adi, 'tr')
                );
                setDistricts(sortedDistricts);
            } else {
                setDistricts([]);
            }
        } else {
            setDistricts([]);
        }
    }, [formData.city, cities]);

    // Dropdown açılınca arama inputuna odaklan
    useEffect(() => {
        if (showCityDropdown) {
            setTimeout(() => citySearchRef.current?.focus(), 50);
        }
    }, [showCityDropdown]);

    useEffect(() => {
        if (showDistrictDropdown) {
            setTimeout(() => districtSearchRef.current?.focus(), 50);
        }
    }, [showDistrictDropdown]);

    // Filtrelenmiş il listesi — "i" yazılınca İstanbul en üstte
    const filteredCities = (() => {
        if (!citySearch.trim()) return cities;
        const q = citySearch.trim();
        const matched = cities.filter(c => trIncludes(c.il_adi, q));
        // İstanbul'u en üste al (küçük "i" yazılınca da)
        const istanbulIdx = matched.findIndex(c => trNormalize(c.il_adi) === 'istanbul');
        if (istanbulIdx > 0) {
            const ist = matched.splice(istanbulIdx, 1)[0];
            matched.unshift(ist);
        }
        return matched;
    })();

    // Filtrelenmiş ilçe listesi
    const filteredDistricts = districtSearch.trim()
        ? districts.filter(d => trIncludes(d.ilce_adi, districtSearch))
        : districts;

    const validateForm = (): string[] => {
        const newErrors: string[] = [];
        if (!formData.city) newErrors.push('İl seçimi yapınız');
        if (!formData.district) newErrors.push('İlçe seçimi yapınız');
        if (!formData.neighborhood.trim()) newErrors.push('Mahalle giriniz');
        if (!formData.street.trim()) newErrors.push('Cadde/Sokak bilgisi giriniz');
        if (!formData.first_name.trim()) newErrors.push('Ad giriniz');
        if (!formData.last_name.trim()) newErrors.push('Soyad giriniz');
        if (!formData.phone.trim()) newErrors.push('Telefon numarası giriniz');
        else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.push('Geçerli bir telefon numarası giriniz');
        }
        return newErrors;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setErrors([]);
        setLoading(true);
        try {
            const res = await fetch('/api/address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                router.push('/adres');
            } else {
                setErrors([data.error || 'Bir hata oluştu']);
            }
        } catch {
            setErrors(['Bağlantı hatası. Lütfen tekrar deneyin.']);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        if (field === 'city') {
            setFormData(prev => ({ ...prev, city: value as string, district: '' }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
        if (errors.length > 0) setErrors([]);
    };

    const closeAllDropdowns = () => {
        setShowCityDropdown(false);
        setShowDistrictDropdown(false);
    };

    // Input style helper
    const inputCls = (hasError: boolean) =>
        `w-full border rounded-xl px-4 py-3.5 outline-none transition-colors text-gray-900 placeholder:text-gray-400 text-[15px] ${
            hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'
        } focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10`;

    return (
        <>
            <style jsx global>{`
                nav.fixed.bottom-0 { display: none !important; }
                main { padding-bottom: 0 !important; }
                header { display: none !important; }
            `}</style>

            <div className="min-h-screen bg-white pb-28" onClick={closeAllDropdowns}>
                {/* Üst Bar */}
                <div className="bg-white px-2 py-3.5 flex items-center justify-between border-b sticky top-0 z-30">
                    <Link href="/sepetim" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeft size={22} className="text-gray-700" />
                    </Link>
                    <h1 className="text-[16px] font-semibold text-gray-900">Teslimat Adresi Belirle</h1>
                    <Link href="/sepetim" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={22} className="text-gray-700" />
                    </Link>
                </div>

                {/* Hata Mesajları */}
                {errors.length > 0 && (
                    <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="font-medium text-red-800 text-sm mb-1">Lütfen aşağıdaki alanları kontrol edin:</p>
                                <ul className="text-xs text-red-600 space-y-1">
                                    {errors.map((error, index) => (
                                        <li key={`error-${index}`}>• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="px-4 pt-5 space-y-5">

                    {/* ───── ADRES BİLGİLERİ ───── */}
                    <div>
                        <p className="text-[13px] font-semibold text-gray-500 mb-3">Adres Bilgileri</p>

                        {/* İL DROPDOWN */}
                        <div className="relative mb-3" onClick={(e) => e.stopPropagation()}>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1 ml-1">İl*</label>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCityDropdown(v => !v);
                                    setShowDistrictDropdown(false);
                                    setCitySearch('');
                                }}
                                className={`w-full border rounded-xl px-4 py-3.5 text-left flex items-center justify-between transition-colors text-[15px] ${
                                    !formData.city && errors.length > 0 ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                } ${showCityDropdown ? 'border-[#0066cc] ring-2 ring-[#0066cc]/10' : ''}`}
                            >
                                <span className={formData.city ? 'text-gray-900' : 'text-gray-400'}>
                                    {formData.city || 'Seçiniz'}
                                </span>
                                {showCityDropdown
                                    ? <ChevronUp size={18} className="text-[#0066cc]" />
                                    : <ChevronDown size={18} className="text-gray-400" />
                                }
                            </button>

                            {showCityDropdown && (
                                <div className="absolute z-40 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                                    {/* Arama */}
                                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                                        <div className="relative">
                                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                ref={citySearchRef}
                                                type="text"
                                                value={citySearch}
                                                onChange={(e) => setCitySearch(e.target.value)}
                                                placeholder="Şehir ara..."
                                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0066cc]"
                                            />
                                        </div>
                                    </div>
                                    {/* Liste */}
                                    <div className="max-h-52 overflow-y-auto">
                                        {filteredCities.length === 0 ? (
                                            <p className="px-4 py-3 text-sm text-gray-400 text-center">Sonuç bulunamadı</p>
                                        ) : (
                                            filteredCities.map((city, index) => (
                                                <button
                                                    key={`city-${city.plaka_kodu}-${index}`}
                                                    type="button"
                                                    onClick={() => {
                                                        handleInputChange('city', city.il_adi);
                                                        setShowCityDropdown(false);
                                                        setCitySearch('');
                                                    }}
                                                    className={`w-full px-4 py-3 text-left text-[14px] border-b border-gray-50 last:border-b-0 transition-colors ${
                                                        formData.city === city.il_adi
                                                            ? 'bg-blue-50 text-[#0066cc] font-semibold'
                                                            : 'text-gray-800 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {city.il_adi}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* İLÇE DROPDOWN */}
                        <div className="relative mb-3" onClick={(e) => e.stopPropagation()}>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1 ml-1">İlçe*</label>
                            <button
                                type="button"
                                onClick={() => {
                                    if (formData.city && districts.length > 0) {
                                        setShowDistrictDropdown(v => !v);
                                        setShowCityDropdown(false);
                                        setDistrictSearch('');
                                    }
                                }}
                                disabled={!formData.city}
                                className={`w-full border rounded-xl px-4 py-3.5 text-left flex items-center justify-between transition-colors text-[15px] ${
                                    !formData.district && errors.length > 0 && formData.city ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                } ${showDistrictDropdown ? 'border-[#0066cc] ring-2 ring-[#0066cc]/10' : ''} disabled:bg-gray-50 disabled:cursor-not-allowed`}
                            >
                                <span className={formData.district ? 'text-gray-900' : 'text-gray-400'}>
                                    {formData.district || 'Seçiniz'}
                                </span>
                                {showDistrictDropdown
                                    ? <ChevronUp size={18} className="text-[#0066cc]" />
                                    : <ChevronDown size={18} className="text-gray-400" />
                                }
                            </button>

                            {showDistrictDropdown && districts.length > 0 && (
                                <div className="absolute z-40 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                                    {/* Arama */}
                                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                                        <div className="relative">
                                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                ref={districtSearchRef}
                                                type="text"
                                                value={districtSearch}
                                                onChange={(e) => setDistrictSearch(e.target.value)}
                                                placeholder="İlçe ara..."
                                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0066cc]"
                                            />
                                        </div>
                                    </div>
                                    {/* Liste */}
                                    <div className="max-h-52 overflow-y-auto">
                                        {filteredDistricts.length === 0 ? (
                                            <p className="px-4 py-3 text-sm text-gray-400 text-center">Sonuç bulunamadı</p>
                                        ) : (
                                            filteredDistricts.map((district, index) => (
                                                <button
                                                    key={`district-${district.ilce_kodu}-${index}`}
                                                    type="button"
                                                    onClick={() => {
                                                        handleInputChange('district', district.ilce_adi);
                                                        setShowDistrictDropdown(false);
                                                        setDistrictSearch('');
                                                    }}
                                                    className={`w-full px-4 py-3 text-left text-[14px] border-b border-gray-50 last:border-b-0 transition-colors ${
                                                        formData.district === district.ilce_adi
                                                            ? 'bg-blue-50 text-[#0066cc] font-semibold'
                                                            : 'text-gray-800 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {district.ilce_adi}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mahalle */}
                        <div className="mb-3">
                            <label className="block text-[11px] font-medium text-gray-500 mb-1 ml-1">Mahalle*</label>
                            <input
                                type="text"
                                value={formData.neighborhood}
                                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                                placeholder="Mahalle adını yazınız"
                                className={inputCls(!formData.neighborhood && errors.length > 0)}
                            />
                        </div>

                        {/* Cadde/Sokak */}
                        <div className="mb-3">
                            <input
                                type="text"
                                value={formData.street}
                                onChange={(e) => handleInputChange('street', e.target.value)}
                                placeholder="Cadde, Sokak*"
                                className={inputCls(!formData.street && errors.length > 0)}
                            />
                        </div>

                        {/* Bina / Kat / Daire */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <input
                                type="text"
                                value={formData.building_no}
                                onChange={(e) => handleInputChange('building_no', e.target.value)}
                                placeholder="Bina No"
                                className="border border-gray-200 rounded-xl px-3 py-3.5 outline-none text-gray-900 placeholder:text-gray-400 text-[14px] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10"
                            />
                            <input
                                type="text"
                                value={formData.floor_no}
                                onChange={(e) => handleInputChange('floor_no', e.target.value)}
                                placeholder="Kat No"
                                className="border border-gray-200 rounded-xl px-3 py-3.5 outline-none text-gray-900 placeholder:text-gray-400 text-[14px] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10"
                            />
                            <input
                                type="text"
                                value={formData.door_no}
                                onChange={(e) => handleInputChange('door_no', e.target.value)}
                                placeholder="Daire No"
                                className="border border-gray-200 rounded-xl px-3 py-3.5 outline-none text-gray-900 placeholder:text-gray-400 text-[14px] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10"
                            />
                        </div>
                        <p className="text-[11px] text-gray-400 ml-1 -mt-1 mb-3">Bina, kat ve daire isteğe bağlıdır</p>

                        {/* Adres Tarifi */}
                        <div className="mb-1">
                            <input
                                type="text"
                                value={formData.address_description}
                                onChange={(e) => handleInputChange('address_description', e.target.value)}
                                placeholder="Adres Tarifi (isteğe bağlı)"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 outline-none text-gray-900 placeholder:text-[#0066cc] placeholder:font-normal text-[15px] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10"
                            />
                        </div>
                    </div>

                    {/* ───── KİŞİSEL BİLGİLER ───── */}
                    <div>
                        <p className="text-[13px] font-semibold text-gray-500 mb-3">Kişisel Bilgiler</p>

                        {/* Ad */}
                        <div className="mb-3">
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => handleInputChange('first_name', e.target.value)}
                                placeholder="Ad*"
                                className={inputCls(!formData.first_name && errors.length > 0)}
                            />
                        </div>

                        {/* Soyad */}
                        <div className="mb-3">
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => handleInputChange('last_name', e.target.value)}
                                placeholder="Soyad*"
                                className={inputCls(!formData.last_name && errors.length > 0)}
                            />
                        </div>

                        {/* Telefon — +90 prefix */}
                        <div className="mb-3">
                            <div className={`flex items-center border rounded-xl overflow-hidden transition-colors ${
                                !formData.phone && errors.length > 0 ? 'border-red-300 bg-red-50' : 'border-gray-200'
                            } focus-within:border-[#0066cc] focus-within:ring-2 focus-within:ring-[#0066cc]/10`}>
                                <span className="px-4 py-3.5 text-[15px] font-semibold text-gray-600 border-r border-gray-200 bg-gray-50 select-none whitespace-nowrap">
                                    +90
                                </span>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={10}
                                    value={formData.phone}
                                    onChange={(e) => {
                                        // Sadece rakam kabul et, max 10 karakter
                                        const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        handleInputChange('phone', onlyNums);
                                    }}
                                    placeholder="5xx xxx xx xx"
                                    className="flex-1 px-4 py-3.5 outline-none text-[15px] text-gray-900 placeholder:text-gray-400 bg-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Alt Bar — Kaydet ve Ödemeye Geç */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_16px_rgba(0,0,0,0.08)] p-4 z-20">
                    <button
                        onClick={() => handleSubmit()}
                        disabled={loading}
                        className="w-full bg-[#0066cc] text-white py-4 rounded-full font-bold text-[16px] disabled:bg-gray-300 hover:bg-[#0055aa] active:bg-[#004499] transition-colors flex items-center justify-center gap-2 shadow-md"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            'Kaydet ve Ödemeye Geç →'
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}