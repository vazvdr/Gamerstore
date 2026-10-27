
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { productsService, type Product } from '@/data/services/produtos.service';

const BANNER_HEIGHT = 'h-[250px] sm:h-[280px] lg:h-[300px]';

export default function Carrossel() {
    const [products, setProducts] = useState<Product[]>([]);
    const [active, setActive] = useState(0);

    useEffect(() => {
        let mounted = true;

        productsService.getAll()
            .then((data) => {
                if (mounted) setProducts(data.filter((product) => product.imageUrl));
            })
            .catch(() => {
                if (mounted) setProducts([]);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const totalSlides = Math.ceil(products.length / 2);

    useEffect(() => {
        if (totalSlides < 2) return;

        const interval = setInterval(() => {
            setActive((current) => (current + 1) % totalSlides);
        }, 5000);

        return () => clearInterval(interval);
    }, [totalSlides]);

    const changeSlide = (direction: number) => {
        setActive((current) => (current + direction + totalSlides) % totalSlides);
    };

    if (!products.length) {
        return (
            <section className="bg-[#080808] px-4 pb-6 pt-6 sm:px-6 lg:px-8">
                <div className={`mx-auto max-w-[1600px] ${BANNER_HEIGHT} animate-pulse rounded-xl border border-lime-500/50 bg-[#101010]`} />
            </section>
        );
    }

    const featured = [
        products[(active * 2) % products.length],
        products[(active * 2 + 1) % products.length],
    ].filter((product): product is Product => Boolean(product));

    return (
        <section className="bg-[#080808] px-4 pb-5 pt-6 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1600px]">
                <div className="relative px-1 sm:px-0">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {featured.map((product, index) => (
                            <Link
                                key={product.id}
                                href={`/produto/${encodeURIComponent(product.id)}`}
                                className={`group relative flex ${BANNER_HEIGHT} min-w-0 items-center overflow-hidden rounded-2xl border bg-[#050505] p-5 transition duration-300 hover:brightness-125 sm:p-7 lg:p-9 ${index === 0 ? 'border-lime-500' : 'border-violet-500'
                                    }`}
                                style={{
                                    background: index === 0
                                        ? 'radial-gradient(ellipse at 75% 50%, rgba(101,163,13,.22), transparent 58%), #050505'
                                        : 'radial-gradient(ellipse at 75% 50%, rgba(124,58,237,.25), transparent 58%), #050505',
                                }}
                            >
                                <div
                                    aria-hidden="true"
                                    className={`pointer-events-none absolute inset-0 opacity-20 ${index === 0
                                        ? 'bg-[linear-gradient(125deg,transparent_35%,#65a30d_50%,transparent_65%)]'
                                        : 'bg-[linear-gradient(125deg,transparent_35%,#7c3aed_50%,transparent_65%)]'
                                        }`}
                                />

                                <div className="relative z-10 flex max-h-full w-[58%] min-w-0 flex-col items-start overflow-hidden">
                                    <p className={`mb-2 shrink-0 text-xs font-black uppercase tracking-[0.2em] sm:text-sm ${index === 0 ? 'text-lime-400' : 'text-violet-400'
                                        }`}>
                                        {product.brand}
                                    </p>

                                    <h2 className="line-clamp-2 text-xl font-black leading-tight sm:text-2xl lg:text-3xl">
                                        {product.name}
                                    </h2>

                                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-zinc-300 sm:text-sm">
                                        {product.description}
                                    </p>

                                    <span className={`mt-4 inline-flex shrink-0 items-center rounded-md border px-3 py-2 text-[10px] font-bold transition group-hover:bg-white group-hover:text-black sm:text-xs ${index === 0 ? 'border-lime-500 text-lime-400' : 'border-violet-500 text-violet-400'
                                        }`}>
                                        CONFERIR PRODUTO <span className="ml-2">→</span>
                                    </span>
                                </div>

                                <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[46%] items-center justify-center overflow-hidden p-3 sm:p-4">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        loading="lazy"
                                        className="max-h-full max-w-full object-contain drop-shadow-[0_0_20px_rgba(132,204,22,0.16)] transition duration-500 group-hover:scale-105"
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {totalSlides > 1 && (
                        <>
                            <button
                                type="button"
                                aria-label="Banner anterior"
                                onClick={() => changeSlide(-1)}
                                className="absolute -left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#101012]/95 text-white shadow-lg transition hover:border-lime-400 hover:text-lime-400 sm:-left-5"
                            >
                                <span className="text-3xl leading-none">‹</span>
                            </button>

                            <button
                                type="button"
                                aria-label="Próximo banner"
                                onClick={() => changeSlide(1)}
                                className="absolute -right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#101012]/95 text-white shadow-lg transition hover:border-lime-400 hover:text-lime-400 sm:-right-5"
                            >
                                <span className="text-3xl leading-none">›</span>
                            </button>
                        </>
                    )}
                </div>

                {totalSlides > 1 && (
                    <div className="mt-4 flex justify-center gap-2">
                        {Array.from({ length: totalSlides }).map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                aria-label={`Ir para o slide ${index + 1}`}
                                aria-current={active === index ? 'true' : undefined}
                                onClick={() => setActive(index)}
                                className={`h-2.5 rounded-full transition-all duration-300 ${active === index
                                    ? 'w-7 bg-lime-400'
                                    : 'w-2.5 bg-zinc-600 hover:bg-zinc-400'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
