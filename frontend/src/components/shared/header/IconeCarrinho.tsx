
'use client';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCarrinho } from '@/data/hooks/useCarrinho';

export default function IconeCarrinho() {
  const quantidadeTotal = useCarrinho((state) =>
    state.itens.reduce(
      (total, item) => total + item.quantidade,
      0,
    ),
  );

  return (
    <Link
      href="/carrinho"
      aria-label={`Carrinho de compras${quantidadeTotal > 0 ? `, ${quantidadeTotal} produtos` : ''}`}
      className="relative cursor-pointer p-2 transition text-zinc-400 hover:text-white hover:scale-105">
      <ShoppingCart size={26} />
      {quantidadeTotal > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-extrabold leading-none text-white">
          {quantidadeTotal > 99 ? '99+' : quantidadeTotal}
        </span>
      )}
    </Link>
  );
}