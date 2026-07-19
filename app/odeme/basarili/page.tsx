'use client';

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { useEffect } from 'react';

export default function BasariliPage() {
    const { clearCart } = useCartStore();

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <>
            <style jsx global>{`
                nav.fixed.bottom-0 { display: none !important; }
                main { padding-bottom: 0 !important; }
                header { display: none !important; }
            `}</style>

            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-800 mb-3">Ödeme Başarılı!</h1>
                    <p className="text-gray-600 mb-6">
                        Siparişiniz başarıyla alındı. Teşekkür ederiz.
                    </p>
                    
                    <div className="space-y-3">
                        <Link 
                            href="/"
                            className="block w-full bg-[#0066cc] text-white py-3 rounded-xl font-medium hover:bg-[#0055aa] transition-colors"
                        >
                            Ana Sayfaya Dön
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
