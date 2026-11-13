import type { Product } from '@/data/services/produtos.service';
import EspecificacaoProduto from './EspecificacaoProduto';

interface DetalhesProdutoProps {
  product: Product;
  specifications: Record<string, unknown>;
}

export default function DetalhesProduto({
  product,
  specifications,
}: DetalhesProdutoProps) {
  return (
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

      <p
        className={`mt-4 text-sm ${
          product.stock > 0 ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {product.stock > 0
          ? `${product.stock} unidades disponíveis`
          : 'Produto indisponível'}
      </p>

      <EspecificacaoProduto
        specifications={specifications}
        stock={product.stock}
      />
    </div>
  );
}