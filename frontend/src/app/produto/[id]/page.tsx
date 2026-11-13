import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Product } from '@/data/services/produtos.service';
import ImagemProduto from '@/components/produto/ImagemProduto';
import DetalhesProduto from '@/components/produto/DetalhesProduto';
import AdicionarProdutoCarrinho from '@/components/produto/AdicionarProdutoCarrinho';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

function parseSpecifications(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      return parsed !== null &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  return value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
async function getProduct(id: string): Promise<Product | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL não está configurada.');
  }
  const response = await fetch(
    `${apiUrl}/produtos/${encodeURIComponent(id)}`,
    { cache: 'no-store' },
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Erro ao buscar produto: ${response.status}`);
  }
  return response.json() as Promise<Product>;
}
export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;
  let product: Product | null;
  try {
    product = await getProduct(id);
  } catch {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center text-white">
        <h1 className="text-2xl font-bold">
          Não foi possível carregar o produto
        </h1>
        <p className="text-zinc-400">
          Verifique sua conexão e tente novamente.
        </p>
        <Link
          href="/products"
          className="rounded-lg bg-lime-400 px-5 py-3 font-semibold text-black transition hover:bg-lime-300">
          Voltar aos produtos
        </Link>
      </main>
    );
  }
  if (!product) notFound();
  const specifications = parseSpecifications(product.specifications);
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto mt-28 max-w-7xl md:mt-26 lg:mt-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <ImagemProduto product={product} />
          <div className="flex flex-col gap-6">
            <DetalhesProduto
              product={product}
              specifications={specifications}/>
            <AdicionarProdutoCarrinho product={product} />
          </div>
        </div>
      </div>
    </main>
  );
}