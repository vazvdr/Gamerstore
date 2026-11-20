import { ConflictException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SincronizarCarrinhoUseCase } from '../../../application/usecases/carrinho/sincronizar-carrinho.usecase';
import type { CarrinhoRepositoryPort } from '../../../application/ports/saida/carrinho-repository.ports';
import type { ProdutoQueryPort, ProdutoParaCarrinho } from '../../../application/ports/saida/produto-query.ports';
import type { Carrinho } from '../../../domain/entities/carrinho';

describe('SincronizarCarrinhoUseCase', () => {
  let useCase: SincronizarCarrinhoUseCase;
  let carrinhoRepository: CarrinhoRepositoryPort;
  let produtoQuery: ProdutoQueryPort;

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

  const produto: ProdutoParaCarrinho = {
    id: 'produto-1',
    name: 'Teclado Gamer',
    brand: 'Logitech',
    model: 'G Pro X',
    imageUrl: 'https://example.com/teclado.png',
    price: '250.00',
    stock: 10,
    reservedStock: 0,
  };

  beforeEach(() => {
    carrinhoRepository = {
      buscarPorUsuarioId: vi.fn(),
      salvar: vi.fn(),
      limpar: vi.fn(),
    } as unknown as CarrinhoRepositoryPort;

    produtoQuery = {
      buscarPorId: vi.fn(),
    } as unknown as ProdutoQueryPort;

    useCase = new SincronizarCarrinhoUseCase(carrinhoRepository, produtoQuery);

    vi.mocked(carrinhoRepository.buscarPorUsuarioId).mockResolvedValue(carrinho);
    vi.mocked(carrinhoRepository.salvar).mockResolvedValue(undefined);
    vi.mocked(produtoQuery.buscarPorId).mockResolvedValue(produto);
  });

  it('deve retornar o carrinho atual quando não houver itens locais', async () => {
    const resultado = await useCase.execute('usuario-1', []);

    expect(resultado).toBe(carrinho);
    expect(produtoQuery.buscarPorId).not.toHaveBeenCalled();
    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve somar a quantidade de um produto que já existe no carrinho', async () => {
    const resultado = await useCase.execute('usuario-1', [
      { produtoId: 'produto-1', quantidade: 3 },
    ]);

    expect(resultado.itens).toHaveLength(2);
    expect(resultado.itens.find((item) => item.produtoId === 'produto-1')?.quantidade).toBe(5);
    expect(carrinhoRepository.salvar).toHaveBeenCalledWith(resultado);
  });

  it('deve adicionar um produto que existe apenas no carrinho local', async () => {
    const novoProduto: ProdutoParaCarrinho = {
      id: 'produto-3',
      name: 'Headset Gamer',
      brand: 'HyperX',
      model: 'Cloud II',
      imageUrl: 'https://example.com/headset.png',
      price: '350.00',
      stock: 8,
      reservedStock: 0,
    };

    vi.mocked(produtoQuery.buscarPorId).mockResolvedValue(novoProduto);

    const resultado = await useCase.execute('usuario-1', [
      { produtoId: 'produto-3', quantidade: 2 },
    ]);

    expect(resultado.itens).toHaveLength(3);
    expect(resultado.itens.find((item) => item.produtoId === 'produto-3')).toEqual({
      produtoId: 'produto-3',
      nome: 'Headset Gamer',
      marca: 'HyperX',
      modelo: 'Cloud II',
      imagemUrl: 'https://example.com/headset.png',
      preco: '350.00',
      quantidade: 2,
    });
  });

  it('deve preservar os produtos que não vieram do carrinho local', async () => {
    const resultado = await useCase.execute('usuario-1', [
      { produtoId: 'produto-1', quantidade: 1 },
    ]);

    expect(resultado.itens.find((item) => item.produtoId === 'produto-2')).toEqual(carrinho.itens[1]);
  });

  it('deve somar quantidades quando o mesmo produto aparecer mais de uma vez nos itens locais', async () => {
    const resultado = await useCase.execute('usuario-1', [
      { produtoId: 'produto-1', quantidade: 2 },
      { produtoId: 'produto-1', quantidade: 3 },
    ]);

    expect(resultado.itens.find((item) => item.produtoId === 'produto-1')?.quantidade).toBe(7);
    expect(produtoQuery.buscarPorId).toHaveBeenCalledOnce();
  });

  it.each([0, -1, 1.5])('deve rejeitar uma quantidade inválida: %s', async (quantidade) => {
    await expect(
      useCase.execute('usuario-1', [{ produtoId: 'produto-1', quantidade }]),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(produtoQuery.buscarPorId).not.toHaveBeenCalled();
    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve rejeitar a sincronização quando a quantidade exceder o estoque disponível', async () => {
    vi.mocked(produtoQuery.buscarPorId).mockResolvedValue({
      ...produto,
      stock: 5,
      reservedStock: 1,
    });

    await expect(
      useCase.execute('usuario-1', [
        { produtoId: 'produto-1', quantidade: 5 },
      ]),
    ).rejects.toMatchObject({
      response: {
        message: 'Estoque insuficiente para sincronizar o produto Teclado Gamer.',
        produtoId: 'produto-1',
        quantidadeSolicitada: 7,
        estoqueDisponivel: 4,
      },
    });

    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve considerar o estoque reservado ao calcular a disponibilidade', async () => {
    vi.mocked(produtoQuery.buscarPorId).mockResolvedValue({
      ...produto,
      stock: 10,
      reservedStock: 3,
    });

    const resultado = await useCase.execute('usuario-1', [
      { produtoId: 'produto-1', quantidade: 5 },
    ]);

    expect(resultado.itens.find((item) => item.produtoId === 'produto-1')?.quantidade).toBe(7);
    expect(carrinhoRepository.salvar).toHaveBeenCalledOnce();
  });

  it('deve propagar erros lançados ao consultar o carrinho', async () => {
    const erro = new Error('Falha ao consultar carrinho');

    vi.mocked(carrinhoRepository.buscarPorUsuarioId).mockRejectedValue(erro);

    await expect(
      useCase.execute('usuario-1', [{ produtoId: 'produto-1', quantidade: 1 }]),
    ).rejects.toBe(erro);
  });

  it('deve propagar erros lançados ao consultar o produto', async () => {
    const erro = new Error('Falha ao consultar produto');

    vi.mocked(produtoQuery.buscarPorId).mockRejectedValue(erro);

    await expect(
      useCase.execute('usuario-1', [{ produtoId: 'produto-1', quantidade: 1 }]),
    ).rejects.toBe(erro);

    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve propagar erros lançados ao salvar o carrinho sincronizado', async () => {
    const erro = new Error('Falha ao salvar carrinho');

    vi.mocked(carrinhoRepository.salvar).mockRejectedValue(erro);

    await expect(
      useCase.execute('usuario-1', [{ produtoId: 'produto-1', quantidade: 1 }]),
    ).rejects.toBe(erro);
  });
});
