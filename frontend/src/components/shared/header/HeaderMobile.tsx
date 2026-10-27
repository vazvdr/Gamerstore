'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUp, Menu, Search, ShoppingCart, X } from 'lucide-react';

import logo from '@/assets/logo.webp';
import { productsService, type Product } from '@/data/services/produtos.service';

const categorias = [
  'Notebooks', 'Processadores', 'Periféricos', 'Áudio', 'Monitores',
  'Placas de Vídeo', 'Placas Mãe', 'Memória RAM', 'Video Games',
];

export default function HeaderMobile() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
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
      <header className="fixed left-0 top-0 z-50 w-full bg-transparent text-white backdrop-blur-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" aria-label="GamerStore - início" className="flex shrink-0 cursor-pointer items-center gap-2">
              <Image src={logo} alt="GamerStore" priority className="h-14 w-14" />
            </Link>

            <div className="flex items-center gap-1">
              <Link href="/login" className="cursor-pointer rounded-lg bg-white px-3 py-2 text-black">
                Entrar
              </Link>

              <Link href="/carrinho" aria-label="Carrinho de compras" className="relative p-2">
                <ShoppingCart size={30} />
              </Link>

              <button type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu" className="cursor-pointer p-1">
                <Menu size={26} />
              </button>
            </div>
          </div>

          <div className="my-2 h-0.5 w-full rounded-full bg-lime-400" />

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSearch();
            }}
            className="relative flex"
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Buscar produtos..."
              aria-label="Buscar produtos"
              className="flex-1 border-b border-lime-400 bg-transparent px-4 py-2 text-white outline-none placeholder:text-zinc-400"
            />

            <button type="submit" aria-label="Buscar" className="cursor-pointer border-b border-lime-400 px-3">
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
                      width={40}
                      height={40}
                      unoptimized
                      className="h-10 w-10 shrink-0 rounded-md border border-zinc-700 object-cover"
                    />
                    <div className="flex min-w-0 flex-col overflow-hidden">
                      <span className="truncate font-medium">{product.name}</span>
                      <span className="truncate text-xs text-zinc-400">
                        {product.description?.slice(0, 50)}...
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </form>
        </div>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Fechar menu de categorias"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-[60] cursor-pointer bg-black/90"
          />

          <aside className="fixed right-0 top-0 z-[70] h-screen w-72 max-w-[85vw] bg-black text-white">
            <div className="flex justify-between border-b border-zinc-800 p-4">
              <span>Categorias</span>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" className="cursor-pointer">
                <X size={22} />
              </button>
            </div>

            <nav className="flex flex-col px-3 py-2">
              {categorias.map((categoria) => (
                <Link
                  key={categoria}
                  href={`/?categoria=${encodeURIComponent(categoria)}`}
                  onClick={() => setMenuOpen(false)}
                  className="cursor-pointer border-b border-zinc-800 py-2 hover:bg-zinc-800"
                >
                  {categoria}
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}

      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Voltar ao topo"
          className="fixed bottom-14 right-6 z-50 cursor-pointer rounded-md bg-white p-2 text-black"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
}
