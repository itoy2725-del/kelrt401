'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AddProductPage() {
    const router = useRouter();
    const [jsonInput, setJsonInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            // JSON'u parse et
            const jsonData = JSON.parse(jsonInput);

            const response = await fetch('/api/products/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonData })
            });

            const data = await response.json();

            if (data.success) {
                setResult({ success: true, message: 'Ürün başarıyla eklendi!' });
                setJsonInput('');
                setTimeout(() => router.push('/admin/products'), 1500);
            } else {
                setResult({ success: false, message: data.error || 'Ürün eklenemedi' });
            }
        } catch (error: any) {
            if (error instanceof SyntaxError) {
                setResult({ success: false, message: 'Geçersiz JSON formatı. Lütfen JSON verisini kontrol edin.' });
            } else {
                setResult({ success: false, message: error.message || 'Bir hata oluştu' });
            }
        } finally {
            setLoading(false);
        }
    };

    const exampleJson = `{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Ürün Adı - Karaca",
  "description": "<p>Ürün açıklaması...</p>",
  "mainEntity": {
    "@type": "WebPageElement",
    "offers": {
      "@type": "Offer",
      "itemOffered": [{
        "@type": "Product",
        "name": "Ürün Adı",
        "brand": { "@type": "Brand", "name": "Marka" },
        "category": "Kategori",
        "image": [
          { "@type": "ImageObject", "contentUrl": "https://..." }
        ],
        "offers": {
          "@type": "Offer",
          "price": "199.90",
          "availability": "https://schema.org/InStock"
        }
      }]
    }
  }
}`;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="flex items-center gap-4 px-4 py-3">
                    <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-lg font-semibold">JSON ile Ürün Ekle</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4">
                {/* Bilgi Kartı */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-blue-800 mb-2">Nasıl Kullanılır?</h3>
                    <p className="text-sm text-blue-700 mb-2">

                    </p>
                    <p className="text-xs text-blue-600">
                        Tarayıcıda F12 → Elements → &lt;script type=&quot;application/ld+json&quot;&gt; içeriğini kopyalayın.
                    </p>
                </div>

                {/* Sonuç Mesajı */}
                {result && (
                    <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${result.success
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                        }`}>
                        {result.success ? (
                            <CheckCircle className="text-green-600" size={24} />
                        ) : (
                            <AlertCircle className="text-red-600" size={24} />
                        )}
                        <span className={result.success ? 'text-green-800' : 'text-red-800'}>
                            {result.message}
                        </span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            JSON-LD Verisi
                        </label>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder={exampleJson}
                            rows={20}
                            className="w-full border border-gray-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !jsonInput.trim()}
                        className="w-full bg-[#0066cc] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0055aa] transition-colors"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Ekleniyor...
                            </>
                        ) : (
                            <>
                                <Upload size={20} />
                                Ürünü Ekle
                            </>
                        )}
                    </button>
                </form>

                {/* Örnek JSON */}
                <div className="mt-8 bg-gray-100 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Örnek JSON Formatı</h3>
                    <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
                        {exampleJson}
                    </pre>
                </div>
            </div>
        </div>
    );
}
