'use client';
import { useCallback, useEffect, useState } from 'react';
import { productsService, type Product } from '@/data/services/produtos.service';
interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await productsService.getAll());
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar os produtos.',
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refetch();
  }, [refetch]);
  return { products, loading, error, refetch };
}