'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, X, Plus, Pencil, Trash2, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Address {
    id: number;
    title: string;
    first_name: string;
    last_name: string;
    phone: string;
    city: string;
    district: string;
    neighborhood: string;
    street: string;
    building_no: string;
    floor_no: string;
    door_no: string;
    address_description: string;
    is_default: boolean;
}

export default function AdresPage() {
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/address');
            const data = await res.json();
            if (data.success) {
                if (data.data.length === 0) {
                    router.push('/adres/yeni');
                    return;
                }
                setAddresses(data.data);
                // Varsayılan adresi seç
                const defaultAddr = data.data.find((a: Address) => a.is_default);
                if (defaultAddr) {
                    setSelectedId(defaultAddr.id);
                } else if (data.data.length > 0) {
                    setSelectedId(data.data[0].id);
                }
            }
        } catch (error) {
            console.error('Adresler yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) return;
        
        try {
            const res = await fetch(`/api/address/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setAddresses(addresses.filter(a => a.id !== id));
                if (selectedId === id) {
                    setSelectedId(addresses.length > 1 ? addresses[0].id : null);
                }
            }
        } catch (error) {
            console.error('Silme hatası:', error);
        }
    };

    const handleContinue = () => {
        if (selectedId) {
            const selectedAddress = addresses.find(a => a.id === selectedId);
            if (selectedAddress) {
                localStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
            }
            router.push('/odeme');
        }
    };

    const formatAddress = (addr: Address) => {
        return `${addr.neighborhood} ${addr.street} Bina No:${addr.building_no} Kat:${addr.floor_no} Daire No:${addr.door_no} ${addr.district}/${addr.city}`;
    };

    return (
        <>
            <style jsx global>{`
                nav.fixed.bottom-0 { display: none !important; }
                main { padding-bottom: 0 !important; }
                header { display: none !important; }
            `}</style>

            <div className="min-h-screen bg-gray-50 pb-24">
                {/* Üst Bar */}
                <div className="bg-white px-4 py-4 flex items-center justify-between border-b sticky top-0 z-10">
                    <Link href="/sepetim" className="p-2">
                        <ArrowLeft size={24} className="text-gray-700" />
                    </Link>
                    <h1 className="text-lg font-semibold text-gray-900">Adresime Gelsin</h1>
                    <Link href="/sepetim" className="p-2">
                        <X size={24} className="text-gray-700" />
                    </Link>
                </div>

                {/* Yeni Adres Ekle */}
                <div className="p-4">
                    <Link 
                        href="/adres/yeni"
                        className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 flex items-center justify-center gap-2 text-[#0066cc] font-medium hover:border-[#0066cc] transition-colors"
                    >
                        <Plus size={20} />
                        Yeni Adres
                    </Link>
                </div>

                {/* Adres Listesi */}
                <div className="px-4 space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066cc]"></div>
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Henüz kayıtlı adresiniz yok.</p>
                            <p className="text-gray-400 text-sm mt-1">Yeni adres ekleyerek başlayın.</p>
                        </div>
                    ) : (
                        addresses.map((address) => (
                            <div 
                                key={address.id}
                                className={`bg-white rounded-xl p-4 border-2 transition-colors cursor-pointer ${
                                    selectedId === address.id 
                                        ? 'border-[#0066cc]' 
                                        : 'border-transparent shadow-sm'
                                }`}
                                onClick={() => setSelectedId(address.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {address.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {formatAddress(address)}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 ml-4">
                                        <Link 
                                            href={`/adres/duzenle/${address.id}`}
                                            className="p-2 text-gray-400 hover:text-[#0066cc] transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Pencil size={18} />
                                        </Link>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(address.id);
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        {selectedId === address.id && (
                                            <div className="w-6 h-6 bg-[#0066cc] rounded flex items-center justify-center">
                                                <Check size={16} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Alt Bar */}
                {addresses.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
                        <button 
                            onClick={handleContinue}
                            disabled={!selectedId}
                            className="w-full bg-[#0066cc] text-white py-4 rounded-full font-bold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#0055aa] transition-colors"
                        >
                            Devam Et
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}