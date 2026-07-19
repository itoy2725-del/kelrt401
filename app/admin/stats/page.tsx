'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Users, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Stats {
    totalVisitors: number;
    todayVisitors: number;
    weekVisitors: number;
    monthVisitors: number;
    dailyStats: { date: string; visitors: number }[];
}

export default function AdminStatsPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStats(data.data);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066cc]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Ziyaretçi İstatistikleri</h1>
                    <Link href="/admin/products" className="text-[#0066cc] hover:underline">
                        ← Ürünlere Dön
                    </Link>
                </div>

                {/* İstatistik Kartları */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="text-blue-600" size={24} />
                            </div>
                            <span className="text-gray-600 text-sm">Toplam</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats?.totalVisitors || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Sepete ürün ekleyen</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Calendar className="text-green-600" size={24} />
                            </div>
                            <span className="text-gray-600 text-sm">Bugün</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats?.todayVisitors || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Ziyaretçi</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <TrendingUp className="text-orange-600" size={24} />
                            </div>
                            <span className="text-gray-600 text-sm">Son 7 Gün</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats?.weekVisitors || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Ziyaretçi</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <ShoppingCart className="text-purple-600" size={24} />
                            </div>
                            <span className="text-gray-600 text-sm">Son 30 Gün</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats?.monthVisitors || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Ziyaretçi</p>
                    </div>
                </div>

                {/* Günlük İstatistikler Tablosu */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="font-bold text-gray-800">Son 7 Günlük Detay</h2>
                    </div>
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tarih</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Ziyaretçi Sayısı</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats?.dailyStats.map((day) => (
                                <tr key={day.date} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {new Date(day.date).toLocaleDateString('tr-TR', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long'
                                        })}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                        {day.visitors}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}