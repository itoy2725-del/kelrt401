'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Zap } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/lib/types';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Ürünler yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
        
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error('Silme hatası:', error);
        }
    };

    const toggleFlashSale = async (id: number, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_flash_sale: !currentStatus })
            });
            if (res.ok) {
                setProducts(products.map(p => 
                    p.id === id ? { ...p, is_flash_sale: !currentStatus } : p
                ));
            }
        } catch (error) {
            console.error('Flash sale güncelleme hatası:', error);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price / 100);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            {/* Başlık */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h1>
                <Link 
                    href="/admin/products/add"
                    className="bg-[#0066cc] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={20} />
                    Yeni Ürün
                </Link>
            </div>

            {/* Ürün Listesi */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066cc]"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ürün Adı</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Fiyat</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Flash</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-700">{product.id}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{product.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{formatPrice(product.price)} TL</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => toggleFlashSale(product.id, product.is_flash_sale)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                product.is_flash_sale 
                                                    ? 'bg-orange-100 text-orange-600' 
                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                            }`}
                                            title={product.is_flash_sale ? 'Flash Sale\'den Çıkar' : 'Flash Sale\'e Ekle'}
                                        >
                                            <Zap size={18} fill={product.is_flash_sale ? 'currentColor' : 'none'} />
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Link 
                                                href={`/admin/products/edit/${product.id}`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Pencil size={18} />
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {products.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Henüz ürün eklenmemiş.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}