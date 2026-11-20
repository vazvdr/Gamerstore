
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdicionarProdutoUseCase, EstoqueInsuficienteError, QuantidadeInvalidaError } from '../../../application/usecases/carrinho/adicionar-produto.usecase';
import type { CarrinhoRepositoryPort } from '../../../application/ports/saida/carrinho-repository.ports';
import type { ProdutoQueryPort, ProdutoParaCarrinho } from '../../../application/ports/saida/produto-query.ports';
import type { Carrinho } from '../../../domain/entities/carrinho';

describe('AdicionarProdutoUseCase', () => {
  let useCase: AdicionarProdutoUseCase;

  const produto: ProdutoParaCarrinho = {
    id: '1',
    brand: 'Logitech',
    model: 'G PRO X SUPERLIGHT',
    name: 'Mouse Logitech G Pro X Superlight',
    price: '599.90',
    imageUrl: 'https://example.com/mouse.webp',
    stock: 10,
    reservedStock: 2,
  };

  const carrinhoRepository = {
    buscarPorUsuarioId: vi.fn(),
    salvar: vi.fn(),
    limpar: vi.fn(),
  };

  const produtoQuery = {
    buscarPorId: vi.fn(),
  };

  const input = { usuarioId: '10', produtoId: '1', quantidade: 2 };

  beforeEach(() => {
    vi.clearAllMocks();
    carrinhoRepository.buscarPorUsuarioId.mockResolvedValue(null);
    carrinhoRepository.salvar.mockResolvedValue(undefined);
    produtoQuery.buscarPorId.mockResolvedValue(produto);

    useCase = new AdicionarProdutoUseCase(
      carrinhoRepository as CarrinhoRepositoryPort,
      produtoQuery as ProdutoQueryPort,
    );
  });

  it('deve adicionar um produto ao carrinho vazio', async () => {
    const resultado = await useCase.execute(input);

    expect(resultado).toEqual({
      usuarioId: '10',
      itens: [{
        produtoId: '1',
        nome: 'Mouse Logitech G Pro X Superlight',
        marca: 'Logitech',
        modelo: 'G PRO X SUPERLIGHT',
        imagemUrl: 'https://example.com/mouse.webp',
        preco: '599.90',
        quantidade: 2,
      }],
    });

    expect(produtoQuery.buscarPorId).toHaveBeenCalledWith('1');
    expect(carrinhoRepository.buscarPorUsuarioId).toHaveBeenCalledWith('10');
    expect(carrinhoRepository.salvar).toHaveBeenCalledWith(resultado);
  });

  it('deve adicionar outro produto preservando os itens existentes', async () => {
    const carrinhoExistente: Carrinho = {
      usuarioId: '10',
      itens: [{
        produtoId: '2',
        nome: 'Teclado Gamer',
        marca: 'HyperX',
        modelo: 'Alloy',
        imagemUrl: null,
        preco: '299.90',
        quantidade: 1,
      }],
    };

    carrinhoRepository.buscarPorUsuarioId.mockResolvedValue(carrinhoExistente);

    const resultado = await useCase.execute(input);

    expect(resultado.itens).toHaveLength(2);
    expect(resultado.itens[0]).toEqual(carrinhoExistente.itens[0]);
    expect(resultado.itens[1].produtoId).toBe('1');
    expect(resultado.itens[1].quantidade).toBe(2);
  });

  it('deve aumentar a quantidade quando o produto já estiver no carrinho', async () => {
    carrinhoRepository.buscarPorUsuarioId.mockResolvedValue({
      usuarioId: '10',
      itens: [{
        produtoId: '1',
        nome: 'Mouse antigo',
        marca: 'Logitech',
        modelo: 'Modelo antigo',
        imagemUrl: null,
        preco: '500.00',
        quantidade: 2,
      }],
    });

    const resultado = await useCase.execute(input);

    expect(resultado.itens).toHaveLength(1);
    expect(resultado.itens[0].quantidade).toBe(4);
    expect(resultado.itens[0].nome).toBe(produto.name);
    expect(carrinhoRepository.salvar).toHaveBeenCalledWith(resultado);
  });

  it('deve considerar o estoque reservado ao calcular o estoque disponível', async () => {
    produtoQuery.buscarPorId.mockResolvedValue({ ...produto, stock: 10, reservedStock: 8 });

    await expect(useCase.execute({ ...input, quantidade: 3 })).rejects.toBeInstanceOf(EstoqueInsuficienteError);
    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve considerar o estoque reservado como zero quando for nulo', async () => {
    produtoQuery.buscarPorId.mockResolvedValue({ ...produto, stock: 5, reservedStock: null });

    const resultado = await useCase.execute({ ...input, quantidade: 5 });

    expect(resultado.itens[0].quantidade).toBe(5);
    expect(carrinhoRepository.salvar).toHaveBeenCalledOnce();
  });

  it('deve rejeitar quantidade zero', async () => {
    await expect(useCase.execute({ ...input, quantidade: 0 })).rejects.toBeInstanceOf(QuantidadeInvalidaError);
    expect(produtoQuery.buscarPorId).not.toHaveBeenCalled();
    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve rejeitar quantidade negativa', async () => {
    await expect(useCase.execute({ ...input, quantidade: -1 })).rejects.toBeInstanceOf(QuantidadeInvalidaError);
    expect(produtoQuery.buscarPorId).not.toHaveBeenCalled();
  });

  it('deve rejeitar quantidade decimal', async () => {
    await expect(useCase.execute({ ...input, quantidade: 1.5 })).rejects.toBeInstanceOf(QuantidadeInvalidaError);
    expect(produtoQuery.buscarPorId).not.toHaveBeenCalled();
  });

  it('deve rejeitar quantidade superior ao estoque disponível', async () => {
    await expect(useCase.execute({ ...input, quantidade: 9 })).rejects.toBeInstanceOf(EstoqueInsuficienteError);
    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve considerar a quantidade já existente ao validar o estoque', async () => {
    carrinhoRepository.buscarPorUsuarioId.mockResolvedValue({
      usuarioId: '10',
      itens: [{
        produtoId: '1',
        nome: produto.name,
        marca: produto.brand,
        modelo: produto.model,
        imagemUrl: produto.imageUrl,
        preco: produto.price,
        quantidade: 7,
      }],
    });

    await expect(useCase.execute({ ...input, quantidade: 2 })).rejects.toBeInstanceOf(EstoqueInsuficienteError);
    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve propagar erros ao buscar o produto', async () => {
    const error = new Error('Erro ao buscar produto');
    produtoQuery.buscarPorId.mockRejectedValue(error);

    await expect(useCase.execute(input)).rejects.toThrow(error);
    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve propagar erros ao buscar o carrinho', async () => {
    const error = new Error('Erro ao buscar carrinho');
    carrinhoRepository.buscarPorUsuarioId.mockRejectedValue(error);

    await expect(useCase.execute(input)).rejects.toThrow(error);
    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve propagar erros ao salvar o carrinho', async () => {
    const error = new Error('Erro ao salvar carrinho');
    carrinhoRepository.salvar.mockRejectedValue(error);

    await expect(useCase.execute(input)).rejects.toThrow(error);
  });
});
