'use client';
import { Suspense } from 'react';
import { filtroProdutosCategorias } from '@/utils/filtroProdutosCategorias';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/data/hooks/useProdutos';
import { useCarrinho } from '@/data/hooks/useCarrinho';

function ProductSectionContent() {
  const searchParams = useSearchParams();
  const categoria = searchParams.get('categoria');
  const { products, loading, error, refetch } = useProducts();
  const adicionarProduto = useCarrinho((state) => state.adicionarProduto);
  const filteredProducts = filtroProdutosCategorias(products, categoria);

  return (
    <section
      id="produtos"
      className="min-h-screen min-w-screen bg-black px-4 pb-12 text-white sm:px-6 lg:px-8">
      <div className="mt-34">
        <h1 className="mb-9 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 bg-clip-text pt-0 text-center text-3xl font-extrabold text-transparent sm:text-4xl">
          {categoria ? `Categoria: ${categoria}` : 'Produtos em destaque'}
        </h1>
        {loading ? (
          <p className="py-16 text-center text-2xl font-bold text-zinc-300">
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
                href={`/produto/${encodeURIComponent(String(product.id))}`}
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-lime-500 transition duration-300 hover:-translate-y-1">
                <div className="flex h-52 items-center justify-center border-b border-lime-500 p-5">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-contain transition duration-300 group-hover:scale-110" />
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
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      adicionarProduto(product);
                    }}
                    disabled={product.stock <= 0}
                    className="mt-auto w-full cursor-pointer rounded-lg bg-white px-3 py-3 font-semibold text-black transition hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-50">
                    {product.stock <= 0
                      ? 'Produto indisponível'
                      : 'Adicionar ao carrinho'}
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
    <Suspense fallback={
      <p className="min-h-screen bg-black py-16 text-center text-zinc-400">
        Carregando produtos...
      </p>
    }>
      <ProductSectionContent />
    </Suspense>
  );
}