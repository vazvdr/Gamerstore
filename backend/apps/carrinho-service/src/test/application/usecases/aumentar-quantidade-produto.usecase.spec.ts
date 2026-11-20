import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AumentarQuantidadeProdutoUseCase, ProdutoNaoEncontradoNoCarrinhoError } from '../../../application/usecases/carrinho/aumentar-quantidade-produto.usecase';
import { EstoqueInsuficienteError } from '../../../application/usecases/carrinho/adicionar-produto.usecase';
import type { CarrinhoRepositoryPort } from '../../../application/ports/saida/carrinho-repository.ports';
import type { ProdutoQueryPort, ProdutoParaCarrinho } from '../../../application/ports/saida/produto-query.ports';
import type { Carrinho } from '../../../domain/entities/carrinho';

describe('AumentarQuantidadeProdutoUseCase', () => {
  let useCase: AumentarQuantidadeProdutoUseCase;

  const produto: ProdutoParaCarrinho = {
    id: '1',
    brand: 'Logitech',
    model: 'G PRO X SUPERLIGHT',
    name: 'Mouse Logitech G Pro X Superlight',
    price: '649.90',
    imageUrl: 'https://example.com/mouse.webp',
    stock: 10,
    reservedStock: 2,
  };

  const carrinho: Carrinho = {
    usuarioId: '10',
    itens: [
      {
        produtoId: '1',
        nome: 'Mouse Logitech G Pro X Superlight',
        marca: 'Logitech',
        modelo: 'G PRO X SUPERLIGHT',
        imagemUrl: 'https://example.com/mouse.webp',
        preco: '599.90',
        quantidade: 2,
      },
      {
        produtoId: '2',
        nome: 'Teclado Gamer',
        marca: 'HyperX',
        modelo: 'Alloy',
        imagemUrl: null,
        preco: '299.90',
        quantidade: 1,
      },
    ],
  };

  const carrinhoRepository = {
    buscarPorUsuarioId: vi.fn(),
    salvar: vi.fn(),
    limpar: vi.fn(),
  };

  const produtoQuery = {
    buscarPorId: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    carrinhoRepository.buscarPorUsuarioId.mockResolvedValue(carrinho);
    carrinhoRepository.salvar.mockResolvedValue(undefined);
    produtoQuery.buscarPorId.mockResolvedValue(produto);

    useCase = new AumentarQuantidadeProdutoUseCase(
      carrinhoRepository as CarrinhoRepositoryPort,
      produtoQuery as ProdutoQueryPort,
    );
  });

  it('deve aumentar a quantidade do produto em uma unidade', async () => {
    const resultado = await useCase.execute('10', '1');

    expect(resultado.itens[0].quantidade).toBe(3);
    expect(carrinhoRepository.salvar).toHaveBeenCalledWith(resultado);
  });

  it('deve atualizar o preço do produto com o valor atual', async () => {
    const resultado = await useCase.execute('10', '1');

    expect(resultado.itens[0].preco).toBe('649.90');
  });

  it('deve preservar os demais itens do carrinho', async () => {
    const resultado = await useCase.execute('10', '1');

    expect(resultado.itens).toHaveLength(2);
    expect(resultado.itens[1]).toEqual(carrinho.itens[1]);
  });

  it('deve preservar os dados do carrinho original', async () => {
    const resultado = await useCase.execute('10', '1');

    expect(resultado.usuarioId).toBe('10');
    expect(carrinho.itens[0].quantidade).toBe(2);
    expect(carrinho.itens[0].preco).toBe('599.90');
  });

  it('deve rejeitar quando o carrinho não existir', async () => {
    carrinhoRepository.buscarPorUsuarioId.mockResolvedValue(null);

    await expect(useCase.execute('10', '1')).rejects.toBeInstanceOf(ProdutoNaoEncontradoNoCarrinhoError);
    expect(produtoQuery.buscarPorId).not.toHaveBeenCalled();
    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve rejeitar quando o produto não estiver no carrinho', async () => {
    await expect(useCase.execute('10', '999')).rejects.toBeInstanceOf(ProdutoNaoEncontradoNoCarrinhoError);
    expect(produtoQuery.buscarPorId).not.toHaveBeenCalled();
    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve rejeitar quando não houver estoque disponível', async () => {
    produtoQuery.buscarPorId.mockResolvedValue({ ...produto, stock: 2, reservedStock: 0 });

    await expect(useCase.execute('10', '1')).rejects.toBeInstanceOf(EstoqueInsuficienteError);
    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve considerar o estoque reservado na validação', async () => {
    produtoQuery.buscarPorId.mockResolvedValue({ ...produto, stock: 10, reservedStock: 8 });

    await expect(useCase.execute('10', '1')).rejects.toBeInstanceOf(EstoqueInsuficienteError);
    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve considerar o estoque reservado como zero quando for nulo', async () => {
    carrinhoRepository.buscarPorUsuarioId.mockResolvedValue({
      usuarioId: '10',
      itens: [{ ...carrinho.itens[0], quantidade: 4 }],
    });
    produtoQuery.buscarPorId.mockResolvedValue({ ...produto, stock: 5, reservedStock: null });

    const resultado = await useCase.execute('10', '1');

    expect(resultado.itens[0].quantidade).toBe(5);
    expect(carrinhoRepository.salvar).toHaveBeenCalledOnce();
  });

  it('deve propagar erros ao buscar o carrinho', async () => {
    const error = new Error('Erro ao buscar carrinho');
    carrinhoRepository.buscarPorUsuarioId.mockRejectedValue(error);

    await expect(useCase.execute('10', '1')).rejects.toThrow(error);
    expect(produtoQuery.buscarPorId).not.toHaveBeenCalled();
  });

  it('deve propagar erros ao buscar o produto', async () => {
    const error = new Error('Erro ao buscar produto');
    produtoQuery.buscarPorId.mockRejectedValue(error);

    await expect(useCase.execute('10', '1')).rejects.toThrow(error);
    expect(carrinhoRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve propagar erros ao salvar o carrinho', async () => {
    const error = new Error('Erro ao salvar carrinho');
    carrinhoRepository.salvar.mockRejectedValue(error);

    await expect(useCase.execute('10', '1')).rejects.toThrow(error);
  });
});
