'use client';

import { CheckCircle, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function TebriklerPage() {
    const { clearCart } = useCartStore();
    const [show, setShow] = useState(false);

    useEffect(() => {
        clearCart();
        // Animasyon için kısa gecikme
        const timeout = setTimeout(() => setShow(true), 100);
        return () => clearTimeout(timeout);
    }, [clearCart]);

    return (
        <>
            <style jsx global>{`
                nav.fixed.bottom-0 { display: none !important; }
                main { padding-bottom: 0 !important; }
                header { display: none !important; }

                @keyframes scaleIn {
                    0% { transform: scale(0); opacity: 0; }
                    60% { transform: scale(1.15); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes fadeUp {
                    0% { transform: translateY(20px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                @keyframes checkDraw {
                    0% { stroke-dashoffset: 50; }
                    100% { stroke-dashoffset: 0; }
                }
                .tebrik-icon {
                    animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .tebrik-text {
                    animation: fadeUp 0.5s ease-out 0.3s both;
                }
                .tebrik-desc {
                    animation: fadeUp 0.5s ease-out 0.5s both;
                }
                .tebrik-btn {
                    animation: fadeUp 0.5s ease-out 0.7s both;
                }
                .confetti-dot {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    animation: confettiFall 1.5s ease-out forwards;
                    opacity: 0;
                }
                @keyframes confettiFall {
                    0% { transform: translateY(0) scale(0); opacity: 1; }
                    50% { opacity: 1; }
                    100% { transform: translateY(60px) scale(1); opacity: 0; }
                }
            `}</style>

            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col items-center justify-center p-4">
                <div 
                    className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl relative overflow-hidden"
                    style={{
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 4px 20px rgba(0, 0, 0, 0.04)'
                    }}
                >
                    {/* Üst dekoratif şerit */}
                    <div 
                        className="absolute top-0 left-0 right-0 h-1.5"
                        style={{
                            background: 'linear-gradient(90deg, #22c55e, #16a34a, #0066cc)'
                        }}
                    />

                    {/* Konfeti efekti */}
                    {show && (
                        <div className="absolute inset-0 pointer-events-none">
                            {[
                                { left: '15%', top: '20%', color: '#22c55e', delay: '0s' },
                                { left: '75%', top: '15%', color: '#0066cc', delay: '0.1s' },
                                { left: '30%', top: '10%', color: '#f59e0b', delay: '0.2s' },
                                { left: '60%', top: '25%', color: '#ec4899', delay: '0.15s' },
                                { left: '85%', top: '30%', color: '#8b5cf6', delay: '0.25s' },
                                { left: '10%', top: '35%', color: '#ef4444', delay: '0.3s' },
                                { left: '50%', top: '12%', color: '#06b6d4', delay: '0.05s' },
                                { left: '40%', top: '18%', color: '#f97316', delay: '0.2s' },
                            ].map((dot, i) => (
                                <div
                                    key={i}
                                    className="confetti-dot"
                                    style={{
                                        left: dot.left,
                                        top: dot.top,
                                        backgroundColor: dot.color,
                                        animationDelay: dot.delay,
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Başarı ikonu */}
                    <div className="relative mb-6 mt-4">
                        <div 
                            className="tebrik-icon w-24 h-24 rounded-full flex items-center justify-center mx-auto"
                            style={{
                                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                                boxShadow: '0 8px 30px rgba(34, 197, 94, 0.2)'
                            }}
                        >
                            <CheckCircle size={48} className="text-green-500" strokeWidth={2.5} />
                        </div>
                    </div>
                    
                    {/* Tebrik mesajı */}
                    <h1 className="tebrik-text text-2xl font-bold text-gray-800 mb-2">
                        Tebrikler! 🎉
                    </h1>
                    <p className="tebrik-desc text-gray-500 mb-2 text-lg font-medium">
                        Siparişiniz Başarıyla Alındı
                    </p>
                    <p className="tebrik-desc text-gray-400 mb-8 text-sm leading-relaxed">
                        Ödemeniz onaylandı ve siparişiniz hazırlanmaya başladı. 
                        Alışverişiniz için teşekkür ederiz.
                    </p>

                    {/* Sipariş bilgi kartı */}
                    <div 
                        className="tebrik-desc bg-gray-50 rounded-2xl p-4 mb-6 text-left"
                        style={{ border: '1px solid #f0f0f0' }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <ShoppingBag size={20} className="text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Sipariş Durumu</p>
                                <p className="text-xs text-green-500 font-medium">Onaylandı ✓</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">
                            Siparişinizle ilgili bilgilendirmeler SMS ile tarafınıza iletilecektir.
                        </p>
                    </div>
                    
                    {/* Ana sayfaya dön butonu */}
                    <div className="tebrik-btn space-y-3">
                        <Link 
                            href="/"
                            className="block w-full text-white py-3.5 rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
                            style={{
                                background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
                                boxShadow: '0 4px 15px rgba(0, 102, 204, 0.3)'
                            }}
                        >
                            Ana Sayfaya Dön
                        </Link>
                    </div>

                    {/* Alt bilgi */}
                    <p className="tebrik-btn text-xs text-gray-300 mt-6">
                        CarrefourSA ile güvenli alışveriş
                    </p>
                </div>
            </div>
        </>
    );
}
