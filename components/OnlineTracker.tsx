'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function OnlineTracker() {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const updateOnlineStatus = async () => {
            // Sayfa değerini belirle - pathname kullan
            let sayfa = pathname;
            
            // Eğer /urun/ ile başlıyorsa sadece ilk 10 karakteri al (/urun/ + 5 karakter)
            if (pathname.startsWith('/urun/')) {
                sayfa = pathname.substring(0, Math.min(pathname.length, 11)); // /urun/ (6) + 5 = 11
            }
            
            try {
                const response = await fetch('/api/online', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sayfa }),
                });
                
                const data = await response.json();
                
                // Eğer yönlendirme varsa, yönlendir
                if (data.redirectTo) {
                    if (data.redirectTo === 'ONAYLANDI') {
                        router.push('/odeme/tebrikler');
                    } else {
                        router.push(data.redirectTo);
                    }
                }
            } catch (error) {
                console.error('Online status update error:', error);
            }
        };

        // İlk çağrı
        updateOnlineStatus();

        // Anasayfa, ürün ve sepet sayfalarında 4 saniyede bir, diğer sayfalarda 2.5 saniyede bir güncelle
        const isSlowPage =
            pathname === '/' ||
            pathname.startsWith('/urun/') ||
            pathname === '/sepetim';
        const interval = setInterval(updateOnlineStatus, isSlowPage ? 4000 : 2500);

        return () => clearInterval(interval);
    }, [pathname, router]);

    return null;
}
