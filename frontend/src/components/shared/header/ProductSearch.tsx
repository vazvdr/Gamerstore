'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useProducts } from '@/data/hooks/useProdutos';

interface ProductSearchProps {
    variant: 'desktop' | 'medium' | 'mobile';
}

function normalizeText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

export default function ProductSearch({ variant }: ProductSearchProps) {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const { products, loading, error } = useProducts();
    const filteredProducts = useMemo(() => {
        const normalizedSearch = normalizeText(search);
        if (normalizedSearch.length < 2) return [];
        const searchTerms = normalizedSearch.split(/\s+/);
        return products
            .filter((product) => {
                const searchableContent = normalizeText(
                    [
                        product.name,
                        product.brand,
                        product.model,
                        product.description,
                        product.tags,
                    ].join(' '),
                );
                return searchTerms.every((term) =>
                    searchableContent.includes(term),
                );
            })
            .slice(0, 6);
    }, [products, search]);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const wrapperClasses = {
        desktop: 'relative flex shrink-0',
        medium: 'relative flex min-w-0 max-w-md flex-1',
        mobile: 'relative flex w-full',
    };
    const inputClasses = {
        desktop:
            'w-44 rounded-bl-md border-b border-l border-lime-400 bg-transparent px-3 py-2 text-lg outline-none placeholder:text-zinc-400',
        medium:
            'min-w-0 flex-1 rounded-bl-md border-b border-l border-lime-400 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-zinc-400',
        mobile:
            'min-w-0 flex-1 border-b border-lime-400 bg-transparent px-4 py-2 text-white outline-none placeholder:text-zinc-400',
    };

    const buttonClasses = {
        desktop:
            'cursor-pointer border-b border-lime-400 px-2 transition hover:text-lime-400',
        medium:
            'flex cursor-pointer items-center border-b border-lime-400 px-2 transition hover:text-lime-400',
        mobile:
            'cursor-pointer border-b border-lime-400 px-3 transition hover:text-lime-400',
    };

    return (
        <div ref={searchRef} className={wrapperClasses[variant]}>
            <form
                className="flex min-w-0 w-full"
                onSubmit={(event) => {
                    event.preventDefault();
                    setIsOpen(true);
                }}>
                <input
                    type="search"
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (search.trim()) setIsOpen(true);
                    }}
                    placeholder="Buscar produtos..."
                    aria-label="Buscar produtos"
                    aria-expanded={isOpen}
                    autoComplete="off"
                    className={inputClasses[variant]}/>
                <button
                    type="submit"
                    aria-label="Buscar"
                    className={buttonClasses[variant]}>
                    <Search size={18} />
                </button>
            </form>
            {isOpen && search.trim().length > 0 && (
                <div className="absolute right-0 top-full z-[60] mt-2 w-full min-w-[280px] overflow-hidden rounded-lg border border-lime-500/50 bg-zinc-950 text-white shadow-xl">
                    {search.trim().length < 2 ? (
                        <p className="p-4 text-sm text-zinc-400">
                            Digite pelo menos 2 caracteres.
                        </p>
                    ) : loading ? (
                        <p className="p-4 text-sm text-zinc-400">
                            Carregando produtos...
                        </p>
                    ) : error ? (
                        <p className="p-4 text-sm text-red-400">
                            Não foi possível carregar os produtos.
                        </p>
                    ) : filteredProducts.length === 0 ? (
                        <p className="p-4 text-sm text-zinc-400">
                            Nenhum produto encontrado.
                        </p>
                    ) : (
                        <ul className="max-h-96 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {filteredProducts.map((product) => (
                                <li key={product.id}>
                                    <Link
                                        href={`/produto/${encodeURIComponent(product.id)}`}
                                        onClick={() => {
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className="flex items-center gap-3 border-b border-zinc-800 p-3 transition last:border-b-0 hover:bg-zinc-800">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="h-12 w-12 shrink-0 object-contain"/>
                                        ) : (
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-zinc-800">
                                                <Search size={18} className="text-zinc-500"/>
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="line-clamp-2 text-sm font-semibold">
                                                {product.name}
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-400">
                                                {product.brand}
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-lime-400">
                                                {product.price.toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                })}
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}