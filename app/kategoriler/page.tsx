import SearchBar from '@/components/SearchBar';
import CategoryCard from '@/components/CategoryCard';
import { Category } from '@/lib/types';

const categories: Category[] = [
    { id: 1, name: 'Tüm İndirimli Ürünler', image_url: '/img/indirim.png', slug: 'indirimli' },
    { id: 2, name: 'Telefon ve Aksesuarları', image_url: '/img/telefon.png', slug: 'telefon' },
    { id: 3, name: 'Bilgisayar ve Aksesuarları', image_url: '/img/bilgisayar.png', slug: 'bilgisayar' },
    { id: 4, name: 'Beyaz Eşya', image_url: '/img/beyaz-esya.png', slug: 'beyaz-esya' },
    { id: 5, name: 'Elektrikli Ev Aletleri', image_url: '/img/elektrikli.png', slug: 'elektrikli' },
    { id: 6, name: 'Oyun Konsolları', image_url: '/img/oyun.png', slug: 'oyun' },
    { id: 7, name: 'Görüntü ve Ses Sistemleri', image_url: '/img/tv.png', slug: 'ses-sistemleri' },
    { id: 8, name: 'Bebek', image_url: '/img/bebek.png', slug: 'bebek' },
    { id: 9, name: 'Isıtma, Soğutma', image_url: '/img/isitma.png', slug: 'isitma-sogutma' },
];

export default function KategorilerPage() {
    return (
        <div className="min-h-screen">
            <SearchBar />
            <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                    {categories.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                    ))}
                </div>
            </div>
        </div>
    );
}