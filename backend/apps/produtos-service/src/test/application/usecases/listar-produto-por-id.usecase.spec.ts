import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListarProdutoPorIdUseCase } from '../../../application/usecases/listar-produto-por-id.usecase';
import type { ProdutoRepositorioPorta } from '../../../application/ports/saida/produto-repository.ports';
import type { Produto } from '../../../domain/entities/produto';

describe('ListarProdutoPorIdUseCase', () => {
  let useCase: ListarProdutoPorIdUseCase;
  let produtoRepository: ProdutoRepositorioPorta;

  const produto: Produto = {
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
  };

  beforeEach(() => {
    produtoRepository = {
      listarProdutos: vi.fn(),
      listarPorId: vi.fn(),
    };

    useCase = new ListarProdutoPorIdUseCase(produtoRepository);
  });

  it('deve retornar o produto quando encontrado', async () => {
    vi.mocked(produtoRepository.listarPorId).mockResolvedValue(produto);

    await expect(useCase.execute('1')).resolves.toEqual(produto);
    expect(produtoRepository.listarPorId).toHaveBeenCalledOnce();
    expect(produtoRepository.listarPorId).toHaveBeenCalledWith('1');
  });

  it('deve lançar NotFoundException quando o ID não for numérico', async () => {
    await expect(useCase.execute('abc')).rejects.toThrow(NotFoundException);
    expect(produtoRepository.listarPorId).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException quando o ID estiver vazio', async () => {
    await expect(useCase.execute('')).rejects.toThrow(NotFoundException);
    expect(produtoRepository.listarPorId).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException quando o ID possuir caracteres especiais', async () => {
    await expect(useCase.execute('1.5')).rejects.toThrow(NotFoundException);
    expect(produtoRepository.listarPorId).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException quando o produto não existir', async () => {
    vi.mocked(produtoRepository.listarPorId).mockResolvedValue(null);

    await expect(useCase.execute('999')).rejects.toThrow(
      new NotFoundException('Produto não encontrado.'),
    );

    expect(produtoRepository.listarPorId).toHaveBeenCalledWith('999');
  });

  it('deve propagar erros lançados pelo repositório', async () => {
    const error = new Error('Erro ao consultar produtos');
    vi.mocked(produtoRepository.listarPorId).mockRejectedValue(error);

    await expect(useCase.execute('1')).rejects.toThrow(error);
  });
});
