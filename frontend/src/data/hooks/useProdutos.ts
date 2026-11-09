'use client';
import { useQuery } from '@tanstack/react-query';
import { productsService, type Product } from '@/data/services/produtos.service';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProducts(): UseProductsReturn {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: productsService.getAll,
  });

  return {
    products: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch: async () => {
      await refetch();
    },
  };
}