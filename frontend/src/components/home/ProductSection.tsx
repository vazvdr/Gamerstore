import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    price: number;
    stock: number;
}

async function getProducts(): Promise<Product[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) throw new Error('A URL da API não está configurada.');
    const response = await fetch(`${apiUrl}/produtos`, {
        cache: 'no-store',
    });
    if (!response.ok) {
        throw new Error('Não foi possível carregar os produtos.');
    }
    const products: Product[] = await response.json();
    return products.map((product) => ({
        ...product,
        price: Number(product.price),
    }));
}
export default async function ProductSection() {
    let products: Product[] = [];
    let error = '';
    try {
        products = await getProducts();
    } catch {
        error = 'Não foi possível carregar os produtos. Tente novamente.';
    }
    return (
        <section id="produtos" className="min-h-screen min-w-screen bg-black px-4 pb-12 text-white sm:px-6 lg:px-8">
            <div className="mt-34">
                <h1 className="mb-9 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 bg-clip-text pt-0 text-center text-3xl font-extrabold text-transparent sm:text-4xl">
                    Produtos em destaque
                </h1>
                {error ? (
                    <div className="py-16 text-center">
                        <p className="mb-4 text-red-400">{error}</p>
                        <a href="/" className="inline-block rounded-lg bg-white px-5 py-2.5 font-semibold text-black transition hover:bg-lime-400">
                            Tentar novamente
                        </a>
                    </div>
                ) : products.length === 0 ? (
                    <p className="py-16 text-center text-zinc-400">
                        Nenhum produto encontrado.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {products.map((product) => (
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