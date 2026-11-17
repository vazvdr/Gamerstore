export interface ProdutoParaCarrinho {
  id: string;
  brand: string;
  model: string;
  name: string;
  price: string;
  imageUrl: string | null;
  stock: number;
  reservedStock: number | null;
}

export interface ProdutoQueryPort {
  buscarPorId(produtoId: string): Promise<ProdutoParaCarrinho>;
}

export const PRODUTO_QUERY = Symbol('PRODUTO_QUERY');