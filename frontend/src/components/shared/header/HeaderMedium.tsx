'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUp, Search, ShoppingCart } from 'lucide-react';
import logo from '@/assets/logo.webp';
import logoTexto from '@/assets/logo-texto.webp';
import { productsService, type Product } from '@/data/services/produtos.service';

const categorias = [
  'Notebooks', 'Processadores', 'Periféricos', 'Áudio', 'Monitores',
  'Placas de Vídeo', 'Placas Mãe', 'Memória RAM', 'Video Games',
];

export default function HeaderMedium() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    const query = search.trim();
    if (!query) {
      setSuggestions([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const products = await productsService.getAll();
        const normalizedQuery = query.toLowerCase();
        setSuggestions(
          products
            .filter((product) =>
              `${product.name} ${product.brand} ${product.description}`
                .toLowerCase()
                .includes(normalizedQuery),
            )
            .slice(0, 5),
        );
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [search]);
  function handleSearch() {
    const query = search.trim();
    if (!query) return;
    window.location.href = `/?busca=${encodeURIComponent(query)}`;
    setSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
  }

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full border-b border-zinc-300 bg-transparent text-white backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-1 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" aria-label="GamerStore - início" className="flex shrink-0 cursor-pointer items-center gap-2">
              <Image src={logo} alt="GamerStore" priority className="h-16 w-auto object-contain" sizes="64px" />
              <Image src={logoTexto} alt="GamerStore" priority className="h-16 w-60 object-contain" sizes="240px" />
            </Link>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch();
              }}
              className="relative flex min-w-0 flex-1 max-w-md"
            >
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Buscar produtos..."
                aria-label="Buscar produtos"
                className="min-w-0 flex-1 rounded-bl-md border-b border-l border-lime-400 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-zinc-400"
              />

              <button type="submit" aria-label="Buscar" className="flex cursor-pointer items-center border-b border-lime-400 px-2">
                <Search size={18} />
              </button>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 top-full z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-md border border-zinc-700 bg-black">
                  {suggestions.map((product) => (
                    <Link
                      key={product.id}
                      href={`/produto/${encodeURIComponent(product.id)}`}
                      onMouseDown={() => {
                        setSearch('');
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-800"
                    >
                      <Image
                        src={product.imageUrl || '/placeholder.png'}
                        alt={product.name}
                        width={48}
                        height={48}
                        unoptimized
                        className="h-12 w-12 shrink-0 rounded-md border border-zinc-700 object-cover"
                      />
                      <div className="flex min-w-0 flex-col overflow-hidden">
                        <span className="truncate font-medium">{product.name}</span>
                        <span className="truncate text-xs text-zinc-400">
                          {product.description?.slice(0, 60)}...
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </form>

            <div className="flex shrink-0 items-center gap-1">
              <Link href="/login" className="cursor-pointer rounded-lg bg-white px-3 py-2 text-sm text-black">
                Entrar
              </Link>

              <Link href="/carrinho" aria-label="Carrinho de compras" className="relative cursor-pointer p-2">
                <ShoppingCart size={20} />
              </Link>
            </div>
          </div>
          <nav className="mt-2 flex justify-between gap-2 text-sm font-bold text-zinc-300">
            {categorias.map((categoria) => (
              <Link
                key={categoria}
                href={`/?categoria=${encodeURIComponent(categoria)}`}
                className="cursor-pointer whitespace-nowrap transition hover:text-lime-400"
              >
                {categoria}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Voltar ao topo"
          className="fixed bottom-14 right-6 z-50 cursor-pointer rounded-md bg-white p-2 text-black shadow-lg">
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
}
