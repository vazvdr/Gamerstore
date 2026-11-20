import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExcluirProdutoUseCase } from '../../../application/usecases/carrinho/excluir-produto.usecase';
import { ProdutoNaoEncontradoNoCarrinhoError } from '../../../application/usecases/carrinho/aumentar-quantidade-produto.usecase';
import type { CarrinhoRepositoryPort } from '../../../application/ports/saida/carrinho-repository.ports';
import type { Carrinho } from '../../../domain/entities/carrinho';

describe('ExcluirProdutoUseCase', () => {
  let useCase: ExcluirProdutoUseCase;
  let carrinhoRepository: CarrinhoRepositoryPort;

  const carrinho: Carrinho = {
    usuarioId: 'usuario-1',
    itens: [
      {
        produtoId: 'produto-1',
        nome: 'Teclado Gamer',
        marca: 'Logitech',
        modelo: 'G Pro X',
        preco: '250.00',
        quantidade: 2,
        imagemUrl: 'https://example.com/teclado.png',
      },
      {
        produtoId: 'produto-2',
        nome: 'Mouse Gamer',
        marca: 'Razer',
        modelo: 'DeathAdder',
        preco: '150.00',
        quantidade: 1,
        imagemUrl: 'https://example.com/mouse.png',
      },
    ],
  };

  beforeEach(() => {
    carrinhoRepository = {
      buscarPorUsuarioId: vi.fn(),
      salvar: vi.fn(),
    } as unknown as CarrinhoRepositoryPort;

    useCase = new ExcluirProdutoUseCase(carrinhoRepository);
  });

  it('deve excluir o produto solicitado do carrinho', async () => {
    vi.mocked(carrinhoRepository.buscarPorUsuarioId).mockResolvedValue(carrinho);

    const resultado = await useCase.execute('usuario-1', 'produto-1');

    expect(resultado.itens).toHaveLength(1);
    expect(resultado.itens[0].produtoId).toBe('produto-2');
    expect(carrinhoRepository.salvar).toHaveBeenCalledOnce();
    expect(carrinhoRepository.salvar).toHaveBeenCalledWith(resultado);
  });

  it('deve preservar os demais produtos do carrinho', async () => {
    vi.mocked(carrinhoRepository.buscarPorUsuarioId).mockResolvedValue(carrinho);

    const resultado = await useCase.execute('usuario-1', 'produto-1');

    expect(resultado.itens).toEqual([carrinho.itens[1]]);
  });

  it('deve lançar erro quando o carrinho não existir', async () => {
    vi.mocked(carrinhoRepository.buscarPorUsuarioId).mockResolvedValue(null as unknown as Carrinho);

    await expect(
      useCase.execute('usuario-1', 'produto-1'),
    ).rejects.toBeInstanceOf(ProdutoNaoEncontradoNoCarrinhoError);

    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando o produto não estiver no carrinho', async () => {
    vi.mocked(carrinhoRepository.buscarPorUsuarioId).mockResolvedValue(carrinho);

    await expect(
      useCase.execute('usuario-1', 'produto-inexistente'),
    ).rejects.toBeInstanceOf(ProdutoNaoEncontradoNoCarrinhoError);

    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve propagar erros lançados pelo repositório', async () => {
    const erro = new Error('Falha ao consultar carrinho');

    vi.mocked(carrinhoRepository.buscarPorUsuarioId).mockRejectedValue(erro);

    await expect(
      useCase.execute('usuario-1', 'produto-1'),
    ).rejects.toBe(erro);
  });
});
