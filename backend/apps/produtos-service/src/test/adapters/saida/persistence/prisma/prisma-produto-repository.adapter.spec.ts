import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaProdutoRepositoryAdapter } from '../../../../../adapters/saida/persistence/prisma/prisma-produto-repository.adapter';
import type { PrismaService } from '../../../../../adapters/saida/persistence/prisma/prisma.service';

describe('PrismaProdutoRepositoryAdapter', () => {
  let adapter: PrismaProdutoRepositoryAdapter;

  const produtoBanco = {
    id: BigInt(1),
    brand: 'Logitech',
    description: 'Mouse gamer sem fio',
    image_url: 'https://example.com/mouse.webp',
    model: 'G PRO X SUPERLIGHT',
    name: 'Mouse Logitech G Pro X Superlight',
    price: { toString: () => '599.90' },
    stock: 10,
    specifications: '{"dpi":25600}',
    tags: 'mouse,gamer,wireless',
    reserved_stock: 2,
  };

  const produtoEsperado = {
    id: '1',
    brand: 'Logitech',
    description: 'Mouse gamer sem fio',
    imageUrl: 'https://example.com/mouse.webp',
    model: 'G PRO X SUPERLIGHT',
    name: 'Mouse Logitech G Pro X Superlight',
    price: '599.90',
    stock: 10,
    specifications: '{"dpi":25600}',
    tags: 'mouse,gamer,wireless',
    reservedStock: 2,
  };

  const prisma = {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new PrismaProdutoRepositoryAdapter(prisma as unknown as PrismaService);
  });

  describe('listarProdutos', () => {
    it('deve retornar todos os produtos mapeados corretamente', async () => {
      prisma.product.findMany.mockResolvedValue([produtoBanco]);

      await expect(adapter.listarProdutos()).resolves.toEqual([produtoEsperado]);

      expect(prisma.product.findMany).toHaveBeenCalledOnce();
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
      });
    });

    it('deve retornar uma lista vazia quando não houver produtos', async () => {
      prisma.product.findMany.mockResolvedValue([]);

      await expect(adapter.listarProdutos()).resolves.toEqual([]);
      expect(prisma.product.findMany).toHaveBeenCalledOnce();
    });

    it('deve preservar valores nulos durante o mapeamento', async () => {
      prisma.product.findMany.mockResolvedValue([
        {
          ...produtoBanco,
          description: null,
          image_url: null,
          specifications: null,
          tags: null,
          reserved_stock: null,
        },
      ]);

      await expect(adapter.listarProdutos()).resolves.toEqual([
        {
          ...produtoEsperado,
          description: null,
          imageUrl: null,
          specifications: null,
          tags: null,
          reservedStock: null,
        },
      ]);
    });

    it('deve propagar erros lançados pelo Prisma', async () => {
      const error = new Error('Erro ao listar produtos');
      prisma.product.findMany.mockRejectedValue(error);

      await expect(adapter.listarProdutos()).rejects.toThrow(error);
    });
  });

  describe('listarPorId', () => {
    it('deve retornar o produto encontrado e mapeado corretamente', async () => {
      prisma.product.findUnique.mockResolvedValue(produtoBanco);

      await expect(adapter.listarPorId('1')).resolves.toEqual(produtoEsperado);

      expect(prisma.product.findUnique).toHaveBeenCalledOnce();
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
    });

    it('deve retornar null quando o produto não existir', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(adapter.listarPorId('999')).resolves.toBeNull();

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(999) },
      });
    });

    it('deve preservar valores nulos durante o mapeamento', async () => {
      prisma.product.findUnique.mockResolvedValue({
        ...produtoBanco,
        description: null,
        image_url: null,
        specifications: null,
        tags: null,
        reserved_stock: null,
      });

      await expect(adapter.listarPorId('1')).resolves.toEqual({
        ...produtoEsperado,
        description: null,
        imageUrl: null,
        specifications: null,
        tags: null,
        reservedStock: null,
      });
    });

    it('deve propagar erros lançados pelo Prisma', async () => {
      const error = new Error('Erro ao consultar produto');
      prisma.product.findUnique.mockRejectedValue(error);

      await expect(adapter.listarPorId('1')).rejects.toThrow(error);
    });
  });
});
