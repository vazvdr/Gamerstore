'use client';
import Link from 'next/link';
import { Plus, Minus, Trash2 } from 'lucide-react';
import type { ItemCarrinho } from '@/data/contexts/CarrinhoContext';
import { useCarrinho } from '@/data/hooks/useCarrinho';

interface ItemProdutoCarrinhoProps {
  item: ItemCarrinho;
}
export default function ItemProdutoCarrinho({
  item,
}: ItemProdutoCarrinhoProps) {
  const aumentarQuantidade = useCarrinho(
    (state) => state.aumentarQuantidade,
  );
  const diminuirQuantidade = useCarrinho(
    (state) => state.diminuirQuantidade,
  );
  const removerProduto = useCarrinho(
    (state) => state.removerProduto,
  );
  return (
    <article className="flex min-w-0 flex-col gap-5 rounded-2xl border border-lime-500 p-5 transition duration-300 hover:border-lime-400 sm:flex-row sm:items-center sm:gap-8">
      <Link
        href={`/produto/${encodeURIComponent(String(item.produtoId))}`}
        className="flex h-40 shrink-0 items-center justify-center sm:w-44 lg:w-48">
        {item.imagemUrl ? (
          <img
            src={item.imagemUrl}
            alt={item.nome}
            loading="lazy"
            className="h-full w-full object-contain transition duration-300 hover:scale-105"/>
        ) : (
          <span className="text-sm text-zinc-500">
            Imagem indisponível
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Link
          href={`/produto/${encodeURIComponent(String(item.produtoId))}`}
          className="line-clamp-2 text-lg font-bold leading-6 transition hover:text-lime-400">
          {item.nome}
        </Link>
        <p className="line-clamp-2 text-sm leading-5 text-zinc-300">
          {item.descricao}
        </p>
        <p className="text-sm text-zinc-400">
          Preço unitário:{' '}
          <span className="font-semibold text-white">
            {item.preco.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </p>
        <span className="w-fit rounded-md bg-[#29292c] px-2 py-1 text-xs text-zinc-200">
          Estoque: {item.estoque}
        </span>
      </div>
      <div className="flex shrink-0 items-center justify-start gap-2 border-t border-zinc-800 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
        <button
          type="button"
          onClick={() => diminuirQuantidade(item.produtoId)}
          disabled={item.quantidade <= 1}
          aria-label="Diminuir quantidade"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-white transition hover:bg-lime-400 hover:text-black disabled:bg-zinc-800 cursor-pointer">
          <Minus size={16} />
        </button>
        <span className="min-w-7 text-center font-bold text-white">
          {item.quantidade}
        </span>
        <button
          type="button"
          onClick={() => aumentarQuantidade(item.produtoId)}
          disabled={item.quantidade >= item.estoque}
          aria-label="Aumentar quantidade"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-white transition hover:bg-lime-400 hover:text-black disabled:bg-zinc-800 cursor-pointer">
          <Plus size={16} />
        </button>
        <button
          type="button"
          onClick={() => removerProduto(item.produtoId)}
          aria-label="Excluir produto do carrinho"
          title="Excluir produto"
          className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#29292c] text-red-400 transition hover:bg-red-500 hover:text-white cursor-pointer">
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}