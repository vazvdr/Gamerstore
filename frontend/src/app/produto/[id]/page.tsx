
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Product } from '@/data/services/produtos.service';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

function parseSpecifications(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : {};
    } catch {
      return {};
    }
  }

  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function formatSpecification(value: unknown): string {
  if (value == null) return '—';
  if (Array.isArray(value)) return value.map(formatSpecification).join(', ');
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key}: ${formatSpecification(item)}`)
      .join(', ');
  }
  return String(value);
}

async function getProduct(id: string): Promise<Product | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL não está configurada.');
  const response = await fetch(
    `${apiUrl}/produtos/${encodeURIComponent(id)}`,
    { cache: 'no-store' },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Erro ao buscar produto: ${response.status}`);
  return response.json() as Promise<Product>;
}
export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  let product: Product | null;
  try {
    product = await getProduct(id);
  } catch {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center text-white">
        <h1 className="text-2xl font-bold">Não foi possível carregar o produto</h1>
        <p className="text-zinc-400">Verifique sua conexão e tente novamente.</p>
        <Link href="/products" className="rounded-lg bg-lime-400 px-5 py-3 font-semibold text-black transition hover:bg-lime-300">
          Voltar aos produtos
        </Link>
      </main>
    );
  }
  if (!product) notFound();
  const specifications = Object.entries(parseSpecifications(product.specifications));
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl mt-28 md:mt-26 lg:mt-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-h-[500px] w-full object-contain"
              />
            ) : (
              <div className="flex h-80 items-center justify-center text-zinc-500">
                Imagem indisponível
              </div>
            )}
          </div>

          <div className="flex flex-col">
            {product.brand && (
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-lime-400">
                {product.brand}
              </p>
            )}

            <h1 className="text-3xl font-bold sm:text-4xl">{product.name}</h1>

            {product.model && (
              <p className="mt-2 text-sm text-zinc-400">{product.model}</p>
            )}

            <p className="mt-6 text-3xl font-bold text-lime-400">
              {Number(product.price).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>

            <p className="mt-4 leading-7 text-zinc-300">{product.description}</p>

            <p className={`mt-4 text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {product.stock > 0 ? `${product.stock} unidades disponíveis` : 'Produto indisponível'}
            </p>

            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold">Especificações</h2>

              {specifications.length > 0 ? (
                <dl className="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
                  {specifications.map(([key, value]) => (
                    <div key={key} className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[minmax(120px,0.8fr)_2fr] sm:gap-4">
                      <dt className="font-medium text-zinc-400">{key}</dt>
                      <dd className="min-w-0 whitespace-normal break-words text-white">
                        {formatSpecification(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-zinc-500">Nenhuma especificação disponível.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
