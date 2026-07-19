import Image from 'next/image';
import Link from 'next/link';
import { Category } from '@/lib/types';

interface CategoryCardProps {
    category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
    // İndirimli ürünler tıklanınca kampanyalar sayfasına git
    const href = category.slug === 'indirimli' 
        ? '/kampanyalar' 
        : `/kategoriler/${category.slug}`;

    return (
        <Link href={href}>
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center justify-center aspect-square hover:shadow-md transition-shadow">
                <div className="relative w-16 h-16 mb-3">
                    <Image
                        src={category.image_url || '/images/placeholder.png'}
                        alt={category.name}
                        fill
                        className="object-contain"
                    />
                </div>
                <span className="text-sm text-center text-gray-700 font-medium">
                    {category.name}
                </span>
            </div>
        </Link>
    );
}