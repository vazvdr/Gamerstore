'use client';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/data/services/produtos.service';
import { useCarrinho } from '@/data/hooks/useCarrinho';

interface AdicionarProdutoCarrinhoProps {
  product: Product;
}

export default function AdicionarProdutoCarrinho({
  product,
}: AdicionarProdutoCarrinhoProps) {
  const adicionarProduto = useCarrinho(
    (state) => state.adicionarProduto,
  );
  if (!product) return null;
  const semEstoque = product.stock <= 0;
  return (
    <button
      type="button"
      onClick={() => adicionarProduto(product)}
      disabled={semEstoque}
      className="flex items-center justify-center gap-2 rounded-lg bg-lime-400 px-5 py-3 font-bold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50">
      <ShoppingCart size={20} />
      {semEstoque ? 'Produto indisponível' : 'Adicionar ao carrinho'}
    </button>
  );
}