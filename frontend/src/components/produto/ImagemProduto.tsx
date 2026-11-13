import type { Product } from '@/data/services/produtos.service';
interface ImagemProdutoProps {
  product: Product;
}

export default function ImagemProduto({ product }: ImagemProdutoProps) {
  return (
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
  );
}