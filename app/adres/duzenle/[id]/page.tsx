'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
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

export default function DuzenleAdresPage() {
    const router = useRouter();
    const params = useParams();
    const addressId = params.id;
    
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        title: '',
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
        is_default: false
    });

    const [cities, setCities] = useState<Il[]>([]);
    const [districts, setDistricts] = useState<Ilce[]>([]);
    
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

    // Adresi ve lokasyon verilerini yükle
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
        
        // Mevcut adresi yükle
        fetch(`/api/address/${addressId}`)
            .then(res => res.json())
            .then(responseData => {
                if (responseData.success) {
                    const addr = responseData.data;
                    setFormData({
                        title: addr.title || '',
                        first_name: addr.first_name || '',
                        last_name: addr.last_name || '',
                        phone: addr.phone || '',
                        city: addr.city || '',
                        district: addr.district || '',
                        neighborhood: addr.neighborhood || '',
                        street: addr.street || '',
                        building_no: addr.building_no || '',
                        floor_no: addr.floor_no || '',
                        door_no: addr.door_no || '',
                        address_description: addr.address_description || '',
                        is_default: addr.is_default || false
                    });
                    
                    // İlçeleri yükle
                    if (addr.city) {
                        const locData = locationData as LocationData;
                        const selectedCity = locData.data.find(c => c.il_adi === addr.city);
                        if (selectedCity && selectedCity.ilceler && Array.isArray(selectedCity.ilceler)) {
                            const sortedDistricts = [...selectedCity.ilceler].sort((a, b) => 
                                a.ilce_adi.localeCompare(b.ilce_adi, 'tr')
                            );
                            setDistricts(sortedDistricts);
                        }
                    }
                }
                setPageLoading(false);
            })
            .catch(() => setPageLoading(false));
    }, [addressId]);

    // İl değişince ilçeleri güncelle
    useEffect(() => {
        if (formData.city && cities.length > 0 && !pageLoading) {
            const selectedCity = cities.find(c => c.il_adi === formData.city);
            if (selectedCity && selectedCity.ilceler && Array.isArray(selectedCity.ilceler)) {
                const sortedDistricts = [...selectedCity.ilceler].sort((a, b) => 
                    a.ilce_adi.localeCompare(b.ilce_adi, 'tr')
                );
                setDistricts(sortedDistricts);
            } else {
                setDistricts([]);
            }
        }
    }, [formData.city, cities, pageLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await fetch(`/api/address/${addressId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            
            if (data.success) {
                router.push('/adres');
            } else {
                alert('Hata: ' + data.error);
            }
        } catch (error) {
            alert('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066cc]"></div>
            </div>
        );
    }

    return (
        <>
            <style jsx global>{`
                nav.fixed.bottom-0 { display: none !important; }
                main { padding-bottom: 0 !important; }
                header { display: none !important; }
            `}</style>

            <div className="min-h-screen bg-white pb-24">
                {/* Üst Bar */}
                <div className="bg-white px-4 py-4 flex items-center justify-between border-b sticky top-0 z-20">
                    <Link href="/adres" className="p-2">
                        <ArrowLeft size={24} className="text-gray-700" />
                    </Link>
                    <h1 className="text-lg font-semibold text-gray-900">Adresi Düzenle</h1>
                    <Link href="/adres" className="p-2">
                        <X size={24} className="text-gray-700" />
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-6">
                    {/* Adres Bilgileri */}
                    <div>
                        <h2 className="text-sm font-medium text-gray-700 mb-4">Adres Bilgileri</h2>
                        
                        {/* İl */}
                        <div className="relative mb-4">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">İl*</label>
                            <button
                                type="button"
                                onClick={() => setShowCityDropdown(!showCityDropdown)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left flex items-center justify-between"
                            >
                                <span className={formData.city ? 'text-gray-900' : 'text-gray-400'}>
                                    {formData.city || 'Seçiniz'}
                                </span>
                                <ChevronDown size={20} className="text-gray-400" />
                            </button>
                            {showCityDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {cities.map((city) => (
                                        <button
                                            key={city.il_adi}
                                            type="button"
                                            onClick={() => {
                                                handleInputChange('city', city.il_adi);
                                                handleInputChange('district', '');
                                                handleInputChange('neighborhood', '');
                                                setShowCityDropdown(false);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50"
                                        >
                                            {city.il_adi}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* İlçe */}
                        <div className="relative mb-4">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">İlçe*</label>
                            <button
                                type="button"
                                onClick={() => formData.city && setShowDistrictDropdown(!showDistrictDropdown)}
                                disabled={!formData.city}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left flex items-center justify-between disabled:bg-gray-50"
                            >
                                <span className={formData.district ? 'text-gray-900' : 'text-gray-400'}>
                                    {formData.district || 'Seçiniz'}
                                </span>
                                <ChevronDown size={20} className="text-gray-400" />
                            </button>
                            {showDistrictDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {districts.map((district) => (
                                        <button
                                            key={district.ilce_adi}
                                            type="button"
                                            onClick={() => {
                                                handleInputChange('district', district.ilce_adi);
                                                handleInputChange('neighborhood', '');
                                                setShowDistrictDropdown(false);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50"
                                        >
                                            {district.ilce_adi}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mahalle */}
                        <div className="relative mb-4">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">Mahalle*</label>
                            <input
                                type="text"
                                value={formData.neighborhood}
                                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                                placeholder="Mahalle adı giriniz"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#0066cc]"
                            />
                        </div>

                        <input
                            type="text"
                            value={formData.street}
                            onChange={(e) => handleInputChange('street', e.target.value)}
                            placeholder="Cadde, Sokak*"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 outline-none focus:border-[#0066cc]"
                        />

                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <input
                                type="text"
                                value={formData.building_no}
                                onChange={(e) => handleInputChange('building_no', e.target.value)}
                                placeholder="Bina No"
                                className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#0066cc]"
                            />
                            <input
                                type="text"
                                value={formData.floor_no}
                                onChange={(e) => handleInputChange('floor_no', e.target.value)}
                                placeholder="Kat No"
                                className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#0066cc]"
                            />
                            <input
                                type="text"
                                value={formData.door_no}
                                onChange={(e) => handleInputChange('door_no', e.target.value)}
                                placeholder="Daire No"
                                className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#0066cc]"
                            />
                        </div>

                        <input
                            type="text"
                            value={formData.address_description}
                            onChange={(e) => handleInputChange('address_description', e.target.value)}
                            placeholder="Adres Tarifi*"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 outline-none focus:border-[#0066cc]"
                        />

                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="Adres Başlığı, Örn: Ev*"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 outline-none focus:border-[#0066cc]"
                        />
                    </div>

                    {/* Kişisel Bilgiler */}
                    <div>
                        <h2 className="text-sm font-medium text-gray-700 mb-4">Kişisel Bilgiler</h2>
                        
                        <input
                            type="text"
                            value={formData.first_name}
                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                            placeholder="Ad*"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 outline-none focus:border-[#0066cc]"
                        />

                        <input
                            type="text"
                            value={formData.last_name}
                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                            placeholder="Soyad*"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 outline-none focus:border-[#0066cc]"
                        />

                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="Telefon Numarası*"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 outline-none focus:border-[#0066cc]"
                        />
                    </div>
                </form>

                {/* Alt Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-[#0066cc] text-white py-4 rounded-full font-bold text-lg disabled:bg-gray-300"
                    >
                        {loading ? 'Kaydediliyor...' : 'Güncelle'}
                    </button>
                </div>
            </div>
        </>
    );
}