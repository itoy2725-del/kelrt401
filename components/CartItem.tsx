'use client';

import Image from 'next/image';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '@/lib/types';
import { useCartStore } from '@/lib/store';

interface CartItemProps {
    item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCartStore();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price / 100);
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex gap-4">
                {/* Ürün Resmi */}
                <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                    <Image
                        src={item.product.image_url || '/img/placeholder.png'}
                        alt={item.product.name}
                        fill
                        className="object-contain p-1"
                    />
                </div>
                
                {/* Ürün Bilgileri */}
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                        {item.product.name}
                    </h3>
                    <button className="text-[#0066cc] text-xs flex items-center gap-1 mb-3">
                        ✏️ Ürün Notu Ekle
                    </button>
                    
                    <div className="flex items-center justify-between">
                        {/* Fiyat - Mavi Renk */}
                        <div>
                            <span className="text-lg font-bold text-[#0066cc]">
                                {formatPrice(item.product.price * item.amount)}
                            </span>
                            <span className="text-[#0066cc] text-sm ml-1">TL</span>
                        </div>
                        
                        {/* Adet Kontrol */}
                        <div className="flex items-center border border-gray-200 rounded-lg">
                            <button
                                onClick={() => item.amount === 1 
                                    ? removeItem(item.product_id)
                                    : updateQuantity(item.product_id, item.amount - 1)
                                }
                                className="p-2 text-gray-400 hover:text-gray-600"
                            >
                                {item.amount === 1 ? <Trash2 size={18} /> : <Minus size={18} />}
                            </button>
                            <span className="px-3 text-sm text-gray-500">
                                {item.amount}
                                <span className="ml-1 text-gray-400">Adet</span>
                            </span>
                            <button
                                onClick={() => updateQuantity(item.product_id, item.amount + 1)}
                                className="p-2 text-gray-600 hover:text-gray-800"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}