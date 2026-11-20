
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiminuirQuantidadeProdutoUseCase } from '../../../application/usecases/carrinho/diminuir-quantidade-produto.usecase';
import { ProdutoNaoEncontradoNoCarrinhoError } from '../../../application/usecases/carrinho/aumentar-quantidade-produto.usecase';
import type { CarrinhoRepositoryPort } from '../../../application/ports/saida/carrinho-repository.ports';
import type { Carrinho } from '../../../domain/entities/carrinho';

describe('DiminuirQuantidadeProdutoUseCase', () => {
  let useCase: DiminuirQuantidadeProdutoUseCase;
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
        quantidade: 3,
        imagemUrl: 'https://example.com/teclado.png',
      },
      {
        produtoId: 'produto-2',
        nome: 'Mouse Gamer',
        marca: 'Razer',
        modelo: 'DeathAdder',
        preco: '150.00',
        quantidade: 2,
        imagemUrl: 'https://example.com/mouse.png',
      },
    ],
  };

  beforeEach(() => {
    carrinhoRepository = {
      buscarPorUsuarioId: vi.fn(),
      salvar: vi.fn(),
    } as unknown as CarrinhoRepositoryPort;

    useCase = new DiminuirQuantidadeProdutoUseCase(carrinhoRepository);
  });

  it('deve diminuir a quantidade do produto em uma unidade', async () => {
    vi.mocked(carrinhoRepository.buscarPorUsuarioId).mockResolvedValue(carrinho);

    const resultado = await useCase.execute('usuario-1', 'produto-1');

    expect(resultado.itens[0].quantidade).toBe(2);
    expect(carrinhoRepository.salvar).toHaveBeenCalledOnce();
    expect(carrinhoRepository.salvar).toHaveBeenCalledWith(resultado);
  });

  it('deve preservar os demais produtos do carrinho', async () => {
    vi.mocked(carrinhoRepository.buscarPorUsuarioId).mockResolvedValue(carrinho);

    const resultado = await useCase.execute('usuario-1', 'produto-1');

    expect(resultado.itens[1]).toEqual(carrinho.itens[1]);
  });

  it('não deve diminuir a quantidade quando ela já for igual a um', async () => {
    const carrinhoComUmItem: Carrinho = {
      ...carrinho,
      itens: [{ ...carrinho.itens[0], quantidade: 1 }],
    };

    vi.mocked(carrinhoRepository.buscarPorUsuarioId).mockResolvedValue(carrinhoComUmItem);

    const resultado = await useCase.execute('usuario-1', 'produto-1');

    expect(resultado).toBe(carrinhoComUmItem);
    expect(resultado.itens[0].quantidade).toBe(1);
    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
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
