import ProductCard from './ProductCard';
import { Product } from '@/lib/types';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ProductSectionProps {
    title: string;
    products: Product[];
    href?: string;
}

export default function ProductSection({ title, products, href }: ProductSectionProps) {
    if (products.length === 0) return null;

    return (
        <section className="py-4">
            <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                {href && (
                    <Link href={href} className="text-[#0066cc] text-sm flex items-center">
                        Tümü <ChevronRight size={16} />
                    </Link>
                )}
            </div>
            <div className="flex overflow-x-auto gap-3 px-4 pb-2 scrollbar-hide">
                {products.map((product) => (
                    <div key={product.id} className="flex-shrink-0 w-44">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </section>
    );
}