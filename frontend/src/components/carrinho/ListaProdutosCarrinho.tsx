import type { ItemCarrinho } from '@/data/contexts/CarrinhoContext';
import ItemProdutoCarrinho from './ItemProdutoCarrinho';

interface ListaProdutosCarrinhoProps {
  itens: ItemCarrinho[];
}

export default function ListaProdutosCarrinho({
  itens,
}: ListaProdutosCarrinhoProps) {
  return (
    <section className="flex min-w-0 flex-col gap-5">
      {itens.map((item) => (
        <ItemProdutoCarrinho key={item.produtoId} item={item} />
      ))}
    </section>
  );
}