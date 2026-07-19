'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Doğrudan /adres sayfasına yönlendir
        router.push('/adres');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header / Logo */}


            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-xl font-bold text-gray-800 mb-6 text-center">Giriş Yap</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kullanıcı Adı / E-posta / Telefon
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                placeholder="Bilgilerinizi giriniz"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Şifre
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                placeholder="Şifrenizi giriniz"
                                required
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-[#003da5] text-white font-bold py-3.5 rounded-lg hover:bg-[#002a84] transition-colors shadow-sm active:scale-[0.98] transform duration-100"
                            >
                                Giriş Yap
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>Hesabınız yok mu? <span className="text-[#ff6600] font-semibold cursor-pointer">Kayıt Ol</span></p>
                    </div>
                </div>
            </main>
        </div>
    );
}
