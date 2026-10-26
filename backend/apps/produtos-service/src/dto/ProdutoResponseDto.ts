
export interface ProdutoResponse {
  id: string;
  brand: string;
  description: string | null;
  imageUrl: string | null;
  model: string;
  name: string;
  price: string;
  stock: number;
  specifications: string | null;
  tags: string | null;
  reservedStock: number | null;
}
