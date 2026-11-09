'use client';
import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/data/hooks/useProdutos';

const categorias: Record<string, string[]> = {
  notebooks: ['notebook'],
  processadores: ['processador'],
  perifericos: ['teclado', 'mouse'],
  audio: ['headset'],
  monitores: ['monitor'],
  'placas de video': ['placa de video'],
  'placas mae': ['placa mae'],
  'memoria ram': ['memoria ram'],
  'video games': ['console'],
};

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function ProductSectionContent() {
  const searchParams = useSearchParams();
  const categoria = searchParams.get('categoria');
  const { products, loading, error, refetch } = useProducts();
  const filteredProducts = useMemo(() => {
    if (!categoria) return products;
    const normalizedCategory = normalizeText(categoria);
    const categoryTags = categorias[normalizedCategory];
    if (!categoryTags) return [];
    return products.filter((product) => {
      const normalizedTag = normalizeText(product.tags);
      return categoryTags.includes(normalizedTag);
    });
  }, [products, categoria]);

  return (
    <section
      id="produtos"
      className="min-h-screen min-w-screen bg-black px-4 pb-12 text-white sm:px-6 lg:px-8">
      <div className="mt-34">
        <h1 className="mb-9 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 bg-clip-text pt-0 text-center text-3xl font-extrabold text-transparent sm:text-4xl">
          {categoria ? `Categoria: ${categoria}` : 'Produtos em destaque'}
        </h1>
        {loading ? (
          <p className="py-16 text-center text-zinc-300 text-2xl font-bold">
            Carregando produtos...
          </p>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="mb-4 text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-block rounded-lg bg-white px-5 py-2.5 font-semibold text-black transition hover:bg-lime-400">
              Tentar novamente
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="py-16 text-center text-zinc-400">
            {categoria
              ? `Nenhum produto encontrado na categoria ${categoria}.`
              : 'Nenhum produto encontrado.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/produto/${encodeURIComponent(product.id)}`}
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-lime-500 transition duration-300 hover:-translate-y-1">
                <div className="flex h-52 items-center justify-center border-b border-lime-500 p-5">
                  {product.imageUrl ? (
                    <img src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-contain transition duration-300 group-hover:scale-105"/>
                  ) : (
                    <span className="text-sm text-zinc-500">
                      Imagem indisponível
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="line-clamp-2 min-h-12 text-lg font-bold leading-6">
                    {product.name}
                  </h2>
                  <p className="mb-4 line-clamp-2 min-h-10 text-sm leading-5 text-zinc-300">
                    {product.description}
                  </p>
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span className="text-xl font-extrabold">
                      {product.price.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                    <span className="shrink-0 rounded-md bg-[#29292c] px-2 py-1 text-xs text-zinc-200">
                      Estoque: {product.stock}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled
                    title="A funcionalidade de carrinho será implementada"
                    className="mt-auto w-full cursor-not-allowed rounded-lg bg-white px-3 py-3 font-semibold text-black opacity-90">
                    Adicionar ao carrinho
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
export default function ProductSection() {
  return (
    <Suspense
      fallback={
        <p className="min-h-screen bg-black py-16 text-center text-zinc-400">
          Carregando produtos...
        </p>
      }>
      <ProductSectionContent />
    </Suspense>
  );
}
