import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function CarrinhoVazio() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-lime-500 px-6 py-12 text-center">
      <ShoppingCart className="mb-5 h-16 w-16 text-lime-400" />

      <h2 className="mb-3 text-2xl font-bold">
        Seu carrinho está vazio
      </h2>

      <p className="mb-7 max-w-md text-sm leading-6 text-zinc-300">
        Você ainda não adicionou nenhum produto. Explore nossa loja e
        encontre os melhores produtos gamer!
      </p>

      <Link
        href="/"
        className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-lime-400"
      >
        Explorar produtos
      </Link>
    </div>
  );
}