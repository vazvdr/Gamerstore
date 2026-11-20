import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListarProdutosUseCase } from '../../../application/usecases/listar-produtos.usecase';
import type { ProdutoRepositorioPorta } from '../../../application/ports/saida/produto-repository.ports';
import type { Produto } from '../../../domain/entities/produto';

describe('ListarProdutosUseCase', () => {
  let useCase: ListarProdutosUseCase;
  let produtoRepository: ProdutoRepositorioPorta;

  const produtos: Produto[] = [
    {
      id: '1',
      brand: 'Logitech',
      description: 'Mouse gamer sem fio',
      imageUrl: 'https://example.com/mouse.webp',
      model: 'G PRO X SUPERLIGHT',
      name: 'Mouse Logitech G Pro X Superlight',
      price: '599.90',
      stock: 10,
      specifications: null,
      tags: 'mouse,gamer,wireless',
      reservedStock: 2,
    },
    {
      id: '2',
      brand: 'HyperX',
      description: 'Headset gamer',
      imageUrl: null,
      model: 'Cloud III',
      name: 'Headset HyperX Cloud III',
      price: '399.90',
      stock: 5,
      specifications: null,
      tags: 'headset,audio,gamer',
      reservedStock: null,
    },
  ];

  beforeEach(() => {
    produtoRepository = {
      listarProdutos: vi.fn(),
      listarPorId: vi.fn(),
    };

    useCase = new ListarProdutosUseCase(produtoRepository);
  });

  it('deve retornar todos os produtos', async () => {
    vi.mocked(produtoRepository.listarProdutos).mockResolvedValue(produtos);

    await expect(useCase.execute()).resolves.toEqual(produtos);
    expect(produtoRepository.listarProdutos).toHaveBeenCalledOnce();
  });

  it('deve retornar uma lista vazia quando não houver produtos', async () => {
    vi.mocked(produtoRepository.listarProdutos).mockResolvedValue([]);

    await expect(useCase.execute()).resolves.toEqual([]);
    expect(produtoRepository.listarProdutos).toHaveBeenCalledOnce();
  });

  it('deve propagar erros lançados pelo repositório', async () => {
    const error = new Error('Erro ao listar produtos');
    vi.mocked(produtoRepository.listarProdutos).mockRejectedValue(error);

    await expect(useCase.execute()).rejects.toThrow(error);
  });
});
