'use client';

import { useState, useRef } from 'react';

interface LogEntry {
    type: 'status' | 'progress' | 'saved' | 'error' | 'complete' | 'fatal';
    message?: string;
    current?: number;
    total?: number;
    url?: string;
    savedCount?: number;
    errorCount?: number;
    product?: {
        name: string;
        price: number;
        imageUrl: string;
        images: string[];
        rating: number;
        reviewCount: number;
        favoriteCount: string;
    };
}

export default function UrunDmn() {
    const [url, setUrl] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [savedProducts, setSavedProducts] = useState<any[]>([]);
    const [stats, setStats] = useState({ saved: 0, errors: 0 });
    const logContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    };

    const startScraping = async () => {
        if (!url.trim()) {
            alert('Lütfen bir URL girin!');
            return;
        }
        if (!categoryName.trim()) {
            alert('Lütfen kategori adı girin!');
            return;
        }

        setIsRunning(true);
        setLogs([]);
        setSavedProducts([]);
        setProgress({ current: 0, total: 0 });
        setStats({ saved: 0, errors: 0 });

        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url.trim(), categoryName: categoryName.trim() })
            });

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('Stream okunamadı');
            }

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const entry: LogEntry = JSON.parse(line);
                        setLogs(prev => [...prev, entry]);

                        if (entry.current && entry.total) {
                            setProgress({ current: entry.current, total: entry.total });
                        }

                        if (entry.type === 'saved' && entry.product) {
                            setSavedProducts(prev => [...prev, entry.product]);
                            setStats(prev => ({ ...prev, saved: prev.saved + 1 }));
                        }

                        if (entry.type === 'error') {
                            setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
                        }

                        if (entry.type === 'complete') {
                            setStats({ saved: entry.savedCount || 0, errors: entry.errorCount || 0 });
                        }

                        setTimeout(scrollToBottom, 50);
                    } catch (e) { /* ignore parse errors */ }
                }
            }

        } catch (error: any) {
            setLogs(prev => [...prev, { type: 'fatal', message: `Bağlantı hatası: ${error.message}` }]);
        } finally {
            setIsRunning(false);
        }
    };

    const progressPercent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            padding: '24px',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            color: '#e0e0e0'
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                * { box-sizing: border-box; }
                
                .glass-card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 24px;
                }

                .input-field {
                    width: 100%;
                    padding: 14px 18px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    color: #fff;
                    font-size: 15px;
                    outline: none;
                    transition: all 0.3s ease;
                    font-family: 'Inter', sans-serif;
                }

                .input-field:focus {
                    border-color: #7c3aed;
                    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
                    background: rgba(255, 255, 255, 0.12);
                }

                .input-field::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .btn-primary {
                    padding: 14px 32px;
                    background: linear-gradient(135deg, #7c3aed, #a855f7);
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-family: 'Inter', sans-serif;
                    min-width: 200px;
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
                }

                .btn-primary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .log-entry {
                    padding: 8px 12px;
                    border-radius: 8px;
                    margin-bottom: 4px;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .log-status { background: rgba(59, 130, 246, 0.15); border-left: 3px solid #3b82f6; }
                .log-progress { background: rgba(234, 179, 8, 0.1); border-left: 3px solid #eab308; }
                .log-saved { background: rgba(34, 197, 94, 0.15); border-left: 3px solid #22c55e; }
                .log-error { background: rgba(239, 68, 68, 0.15); border-left: 3px solid #ef4444; }
                .log-complete { background: rgba(124, 58, 237, 0.2); border-left: 3px solid #7c3aed; }
                .log-fatal { background: rgba(239, 68, 68, 0.25); border-left: 3px solid #dc2626; }

                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #7c3aed, #a855f7, #c084fc);
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }

                .product-card {
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 12px;
                    display: flex;
                    gap: 12px;
                    animation: slideIn 0.4s ease;
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .product-card img {
                    width: 80px;
                    height: 80px;
                    object-fit: cover;
                    border-radius: 8px;
                    background: rgba(255,255,255,0.1);
                }

                .stat-box {
                    padding: 16px 20px;
                    border-radius: 12px;
                    text-align: center;
                    min-width: 120px;
                }

                .spinner {
                    display: inline-block;
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255,255,255,0.2);
                    border-top: 2px solid #a855f7;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>

            {/* Header */}
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{
                        fontSize: 28,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #a855f7, #c084fc, #e879f9)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: 8
                    }}>
                        🛒 Ürün Scraper
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                        Karaca.com ürünlerini otomatik olarak veritabanına kaydedin
                    </p>
                </div>

                {/* Input Alanı */}
                <div className="glass-card" style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                                📂 Kategori Adı
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Örn: Yemek Takımları"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                disabled={isRunning}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                                🔗 Karaca Kategori URL
                            </label>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="https://www.karaca.com/yemek-takimlari"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    disabled={isRunning}
                                    style={{ flex: 1 }}
                                />
                                <button
                                    className="btn-primary"
                                    onClick={startScraping}
                                    disabled={isRunning}
                                >
                                    {isRunning ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                            <span className="spinner"></span>
                                            İşleniyor...
                                        </span>
                                    ) : '🚀 Ürünleri Çek ve Kaydet'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* İstatistikler */}
                {(progress.total > 0 || stats.saved > 0) && (
                    <div className="glass-card" style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
                            <div className="stat-box" style={{ background: 'rgba(124, 58, 237, 0.15)' }}>
                                <div style={{ fontSize: 24, fontWeight: 700, color: '#a855f7' }}>{progress.total}</div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Toplam Ürün</div>
                            </div>
                            <div className="stat-box" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
                                <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>{stats.saved}</div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Kaydedildi</div>
                            </div>
                            <div className="stat-box" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                                <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{stats.errors}</div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Hata</div>
                            </div>
                            <div className="stat-box" style={{ background: 'rgba(234, 179, 8, 0.15)' }}>
                                <div style={{ fontSize: 24, fontWeight: 700, color: '#eab308' }}>{progressPercent}%</div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>İlerleme</div>
                            </div>
                        </div>

                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                            {progress.current} / {progress.total} ürün işlendi
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    {/* Log Paneli */}
                    <div className="glass-card" style={{ maxHeight: 500, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            📋 İşlem Günlüğü
                            {isRunning && <span style={{ animation: 'pulse 1.5s infinite', fontSize: 10, color: '#22c55e' }}>● CANLI</span>}
                        </h3>
                        <div ref={logContainerRef} style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
                            {logs.length === 0 && (
                                <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>
                                    Henüz işlem başlamadı
                                </div>
                            )}
                            {logs.map((log, i) => (
                                <div key={i} className={`log-entry log-${log.type}`}>
                                    <span>
                                        {log.type === 'status' && '📢'}
                                        {log.type === 'progress' && '⏳'}
                                        {log.type === 'saved' && '✅'}
                                        {log.type === 'error' && '❌'}
                                        {log.type === 'complete' && '🎉'}
                                        {log.type === 'fatal' && '💀'}
                                    </span>
                                    <span style={{ flex: 1 }}>
                                        {log.message || (log.type === 'saved' && log.product ? `${log.product.name}` : '')}
                                    </span>
                                    {log.current && log.total && (
                                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                                            {log.current}/{log.total}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Kaydedilen Ürünler */}
                    <div className="glass-card" style={{ maxHeight: 500, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                            🛍️ Kaydedilen Ürünler ({savedProducts.length})
                        </h3>
                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {savedProducts.length === 0 && (
                                <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>
                                    Henüz ürün kaydedilmedi
                                </div>
                            )}
                            {savedProducts.map((product, i) => {
                                const firstImage = product.imageUrl?.split(',')[0] || '';
                                return (
                                    <div key={i} className="product-card">
                                        {firstImage && (
                                            <img
                                                src={firstImage}
                                                alt={product.name}
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {product.name}
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                                                <span style={{ color: '#22c55e', fontWeight: 600 }}>
                                                    {(product.price / 100).toLocaleString('tr-TR')} TL
                                                </span>
                                                {product.rating > 0 && <span>⭐ {product.rating}</span>}
                                                {product.reviewCount > 0 && <span>💬 {product.reviewCount}</span>}
                                                {product.favoriteCount && <span>❤️ {product.favoriteCount}</span>}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                                                📸 {product.images?.length || 0} resim
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
