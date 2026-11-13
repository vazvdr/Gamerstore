import type { Product } from '@/data/services/produtos.service';
import { categorias } from '@/constants/categorias';
import { normalizeText } from '@/utils/normalizeText';

export function filtroProdutosCategorias(
  products: Product[],
  categoria?: string | null,
): Product[] {
  if (!categoria) return products;

  const normalizedCategory = normalizeText(categoria);

  const selectedCategory = categorias.find(
    (item) => item.slug === normalizedCategory,
  );

  if (!selectedCategory) return [];

  return products.filter((product) =>
    selectedCategory.tags.includes(normalizeText(product.tags)),
  );
}