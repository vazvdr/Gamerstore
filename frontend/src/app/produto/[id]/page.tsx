
'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  productsService,
  type Product,
} from '@/data/services/produtos.service';

function formatPrice(price: number) {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatSpecification(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError(null);

      try {
        const data = await productsService.getById(id);
        if (active) setProduct(data);
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar o produto.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] px-5 py-12 text-white">
        <div className="mx-auto grid max-w-[1260px] gap-8 md:grid-cols-2">
          <div className="h-[400px] animate-pulse rounded-xl border border-lime-500/50 bg-[#151517]" />
          <div className="h-80 animate-pulse rounded-xl bg-[#151517]" />
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080808] px-5 text-center text-white">
        <h1 className="text-2xl font-bold">Produto não encontrado</h1>
        <p className="text-zinc-400">
          {error ?? 'Não foi possível encontrar este produto.'}
        </p>
        <Link
          href="/"
          className="rounded-lg bg-white px-5 py-3 font-semibold text-black transition hover:bg-lime-400"
        >
          Voltar para a loja
        </Link>
      </main>
    );
  }

  const specifications = Object.entries(product.specifications ?? {});

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-black to-[#171719] px-5 py-8 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1260px] mt-30">
        <section className="grid items-start gap-8 md:grid-cols-[1fr_1fr] lg:gap-11">
          <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl border border-lime-500 bg-black p-6 sm:min-h-[400px] sm:p-10">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-h-[460px] w-full object-contain"
              />
            ) : (
              <span className="text-zinc-500">Imagem indisponível</span>
            )}
          </div>

          <div className="py-1">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-5 text-base leading-relaxed text-slate-300">
              {product.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <p>
                Marca: <span className="font-semibold">{product.brand}</span>
              </p>
              <p>
                Modelo: <span className="font-semibold">{product.model}</span>
              </p>
            </div>

            <p className="mt-5 text-3xl font-extrabold text-emerald-400 sm:text-4xl">
              {formatPrice(product.price)}
            </p>

            <p className="mt-5 text-sm text-slate-400">
              Estoque disponível: {product.stock}
            </p>

            <button
              type="button"
              disabled
              title="A funcionalidade de carrinho será implementada"
              className="mt-8 rounded-lg bg-white px-7 py-4 font-semibold text-black opacity-90"
            >
              Adicionar ao carrinho
            </button>
          </div>
        </section>

        {specifications.length > 0 && (
          <section className="mt-12 rounded-xl bg-[#19191b] p-5 sm:p-7">
            <h2 className="mb-5 text-xl font-bold">Especificações</h2>

            <dl className="grid gap-x-6 sm:grid-cols-2">
              {specifications.map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-start justify-between gap-4 border-b border-zinc-700 py-3"
                >
                  <dt className="text-sm text-slate-200">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </dt>
                  <dd className="max-w-[60%] break-words text-right text-sm text-slate-400">
                    {formatSpecification(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </main>
  );
}
