'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerSlide {
    id: number;
    imageUrl: string;
    link: string;
    alt: string;
}

const bannerSlides: BannerSlide[] = [

    {
        id: 3,
        imageUrl: 'https://images.migrosone.com/elektronik/banner/main_page_slider/141335/143369-banner-20251217162903-9a7cf6.jpg',
        link: '/kampanyalar',
        alt: 'Aldım Bitti Ürünleri'
    },
    {
        id: 4,
        imageUrl: 'https://images.migrosone.com/elektronik/banner/main_page_slider/142394/144428-banner-20251225144406-1dd253.jpg',
        link: '/kampanyalar',
        alt: 'Haftanın Öne Çıkanları'
    },
    {
        id: 5,
        imageUrl: 'https://images.migrosone.com/elektronik/banner/main_page_slider/142291/144325-banner-20251224151313-36e492.jpg',
        link: '/kampanyalar',
        alt: 'İmzalı Kitaplar Migros Ekstrada'
    },
    {
        id: 6,
        imageUrl: 'https://images.migrosone.com/elektronik/banner/main_page_slider/140966/143000-banner-20251215155527-89dba5.jpg',
        link: '/kampanyalar',
        alt: 'Skechers'
    },
    {
        id: 8,
        imageUrl: 'https://images.migrosone.com/elektronik/banner/main_page_slider/135810/137844-banner-20251111092550-f120c6.jpg',
        link: '/kampanyalar',
        alt: 'Hayatı Kolaylaştıran Pratik Ürünler'
    },
    {
        id: 9,
        imageUrl: 'https://images.migrosone.com/elektronik/banner/main_page_slider/139463/141497-banner-20251203153208-7af6ac.jpg',
        link: '/kampanyalar',
        alt: 'LEGO Setleriyle Hayal Gücünü Keşfet'
    },
    {
        id: 10,
        imageUrl: 'https://images.migrosone.com/elektronik/banner/main_page_slider/139382/141416-banner-20251203135343-f22de0.jpg',
        link: '/kampanyalar',
        alt: 'Hot Wheels Dünyasını Keşfet'
    }
];

export default function Banner() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
    }, []);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            nextSlide();
        }, 4000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide]);

    return (
        <div className="relative w-full overflow-hidden rounded-xl">
            {/* Slider Container */}
            <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {bannerSlides.map((slide) => (
                    <div key={slide.id} className="w-full flex-shrink-0">
                        <Link href={slide.link} aria-label="Afişe Git">
                            <div className="relative w-full aspect-[358/100]">
                                <Image
                                    src={slide.imageUrl}
                                    alt={slide.alt}
                                    fill
                                    className="object-cover rounded-xl"
                                    sizes="100vw"
                                    priority={slide.id === 1}
                                />
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={() => { prevSlide(); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 5000); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-md z-10"
                aria-label="Önceki slayt"
            >
                <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <button
                onClick={() => { nextSlide(); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 5000); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-md z-10"
                aria-label="Sonraki slayt"
            >
                <ChevronRight size={20} className="text-gray-700" />
            </button>

            {/* Pagination */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                <span>{currentSlide + 1}</span> / <span>{bannerSlides.length}</span>
            </div>

            {/* Dots */}
            <div className="absolute bottom-2 right-2 flex gap-1">
                {bannerSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-white/50'
                            }`}
                        aria-label={`Slayt ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}