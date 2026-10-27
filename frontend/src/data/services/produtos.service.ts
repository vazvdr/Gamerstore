
import { api } from '@/data/api/api';

export interface Product {
  id: string;
  brand: string;
  description: string;
  imageUrl: string;
  model: string;
  name: string;
  price: number;
  stock: number;
  specifications: Record<string, unknown>;
  tags: string;
  reservedStock: number;
}

interface ProductResponse extends Omit<Product, 'price' | 'specifications'> {
  price: string | number;
  specifications: string | Record<string, unknown>;
}

function normalizeProduct(product: ProductResponse): Product {
  let specifications: Record<string, unknown> = {};

  try {
    specifications =
      typeof product.specifications === 'string'
        ? JSON.parse(product.specifications)
        : product.specifications ?? {};
  } catch {
    specifications = {};
  }

  return {
    ...product,
    price: Number(product.price),
    specifications,
  };
}

export const productsService = {
  async getAll(): Promise<Product[]> {
    const { data } = await api.get<ProductResponse[]>('/produtos');
    return data.map(normalizeProduct);
  },

  async getById(id: string): Promise<Product> {
    const { data } = await api.get<ProductResponse>(
      `/produtos/${encodeURIComponent(id)}`,
    );
    return normalizeProduct(data);
  },
};
