'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { X, Check, SlidersHorizontal } from 'lucide-react';

interface ProductGridProps {
    initialProducts: Product[];
    initialHasMore: boolean;
    categories?: string[];
    defaultCategories?: string[];
}

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const sortLabels: Record<SortOption, string> = {
    'newest': 'Newest',
    'price-asc': 'Price: Low → High',
    'price-desc': 'Price: High → Low',
    'name-asc': 'Name: A → Z',
    'name-desc': 'Name: Z → A',
};

export default function ProductGrid({ initialProducts, initialHasMore, categories = [], defaultCategories = [] }: ProductGridProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const observerRef = useRef<HTMLDivElement>(null);

    // Filter/Sort state
    const [activeSort, setActiveSort] = useState<SortOption>('newest');
    const [activeCategory, setActiveCategory] = useState<string>('');

    // Temp state for panel (applied on "Apply")
    const [tempSort, setTempSort] = useState<SortOption>('newest');
    const [tempCategory, setTempCategory] = useState<string>('');

    const buildUrl = useCallback((offset: number, sort: SortOption, category: string) => {
        const params = new URLSearchParams();
        params.set('limit', '20');
        params.set('offset', String(offset));
        params.set('sort', sort);
        if (category) {
            params.set('category', category);
        } else if (defaultCategories.length > 0) {
            params.set('categories', defaultCategories.join(','));
        }
        return `/api/products?${params.toString()}`;
    }, [defaultCategories]);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const res = await fetch(buildUrl(products.length, activeSort, activeCategory));
            const data = await res.json();
            if (data.success && data.data.length > 0) {
                setProducts(prev => [...prev, ...data.data]);
                setHasMore(data.hasMore);
            } else {
                setHasMore(false);
            }
        } catch {
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, products.length, activeSort, activeCategory, buildUrl]);

    // Infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );
        const el = observerRef.current;
        if (el) observer.observe(el);
        return () => { if (el) observer.unobserve(el); };
    }, [hasMore, loading, loadMore]);

    // Apply filter/sort
    const applyFilters = async () => {
        setIsFilterOpen(false);
        setActiveSort(tempSort);
        setActiveCategory(tempCategory);
        setLoading(true);
        setProducts([]);
        setHasMore(true);
        try {
            const res = await fetch(buildUrl(0, tempSort, tempCategory));
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
                setHasMore(data.hasMore);
            }
        } catch {
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setTempSort('newest');
        setTempCategory('');
    };

    const openPanel = () => {
        setTempSort(activeSort);
        setTempCategory(activeCategory);
        setIsFilterOpen(true);
    };

    const hasActiveFilters = activeSort !== 'newest' || activeCategory !== '';

    return (
        <>
            {/* Filter & Sort Button */}
            <div className="px-4 py-3">
                <button
                    onClick={openPanel}
                    className={`w-full border rounded-full py-3 px-6 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                        hasActiveFilters
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    <SlidersHorizontal size={16} />
                    Filter & Sort
                    {hasActiveFilters && (
                        <span className="bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ml-1">
                            {(activeSort !== 'newest' ? 1 : 0) + (activeCategory ? 1 : 0)}
                        </span>
                    )}
                </button>
            </div>

            {/* Products Grid */}
            <div className="px-2 pb-8">
                <div className="grid grid-cols-2 gap-px bg-gray-100">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {/* Empty state */}
                {!loading && products.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No products found.</p>
                        {hasActiveFilters && (
                            <button
                                onClick={() => {
                                    setTempSort('newest');
                                    setTempCategory('');
                                    setActiveSort('newest');
                                    setActiveCategory('');
                                    // Reload with no filters
                                    setProducts(initialProducts);
                                    setHasMore(initialHasMore);
                                }}
                                className="mt-3 text-sm text-blue-600 underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {/* Infinite scroll trigger */}
                <div ref={observerRef} className="py-6 flex justify-center">
                    {loading && (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    )}
                    {!hasMore && products.length > 0 && (
                        <p className="text-gray-400 text-sm">All products loaded</p>
                    )}
                </div>
            </div>

            {/* Filter & Sort Bottom Sheet */}
            {isFilterOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={() => setIsFilterOpen(false)}
                    />
                    {/* Panel */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl animate-slide-up">
                        {/* Panel Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <h2 className="text-lg font-bold text-gray-900">Filter & Sort</h2>
                            <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={22} />
                            </button>
                        </div>

                        {/* Panel Body */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                            {/* Sort Section */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Sort By</h3>
                                <div className="space-y-1">
                                    {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => setTempSort(key)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${
                                                tempSort === key
                                                    ? 'bg-black text-white'
                                                    : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span>{sortLabels[key]}</span>
                                            {tempSort === key && <Check size={18} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category Filter */}
                            {categories.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Category</h3>
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => setTempCategory('')}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${
                                                tempCategory === ''
                                                    ? 'bg-black text-white'
                                                    : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span>All Categories</span>
                                            {tempCategory === '' && <Check size={18} />}
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setTempCategory(cat)}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${
                                                    tempCategory === cat
                                                        ? 'bg-black text-white'
                                                        : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                                                }`}
                                            >
                                                <span>{cat}</span>
                                                {tempCategory === cat && <Check size={18} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Panel Footer */}
                        <div className="px-5 py-4 border-t flex gap-3">
                            <button
                                onClick={resetFilters}
                                className="flex-1 py-3 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                onClick={applyFilters}
                                className="flex-[2] py-3 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-900 transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
