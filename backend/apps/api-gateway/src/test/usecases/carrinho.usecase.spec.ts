
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CarrinhoUseCase } from '../../usecases/carrinho.usecase';
import { CarrinhoGatewayPort } from '../../application/ports/saida/carrinho-gateway.ports';

describe('CarrinhoUseCase', () => {
  let useCase: CarrinhoUseCase;
  let carrinhoGateway: CarrinhoGatewayPort;

  const userId = 'user-123';

  beforeEach(() => {
    carrinhoGateway = {
      consultarCarrinho: vi.fn().mockResolvedValue({ itens: [] }),
      adicionarProdutoCarrinho: vi.fn().mockResolvedValue({ sucesso: true }),
      sincronizarCarrinho: vi.fn().mockResolvedValue({ sucesso: true }),
      aumentarQuantidadeProduto: vi.fn().mockResolvedValue({ sucesso: true }),
      diminuirQuantidadeProduto: vi.fn().mockResolvedValue({ sucesso: true }),
      excluirProdutoCarrinho: vi.fn().mockResolvedValue({ sucesso: true }),
      limparCarrinho: vi.fn().mockResolvedValue({ sucesso: true }),
    };

    useCase = new CarrinhoUseCase(carrinhoGateway);
  });

  it('deve consultar o carrinho do usuário', async () => {
    await expect(useCase.consultarCarrinho(userId)).resolves.toEqual({ itens: [] });

    expect(carrinhoGateway.consultarCarrinho).toHaveBeenCalledWith(userId);
  });

  it('deve adicionar um produto ao carrinho', async () => {
    const body = { produtoId: 'produto-1', quantidade: 2 };

    await expect(useCase.adicionarProdutoCarrinho(body, userId)).resolves.toEqual({
      sucesso: true,
    });

    expect(carrinhoGateway.adicionarProdutoCarrinho).toHaveBeenCalledWith(body, userId);
  });

  it('deve sincronizar os itens do carrinho', async () => {
    const body = {
      itens: [
        { produtoId: 'produto-1', quantidade: 2 },
        { produtoId: 'produto-2', quantidade: 1 },
      ],
    };

    await expect(useCase.sincronizarCarrinho(body, userId)).resolves.toEqual({
      sucesso: true,
    });

    expect(carrinhoGateway.sincronizarCarrinho).toHaveBeenCalledWith(body, userId);
  });

  it('deve aumentar a quantidade de um produto', async () => {
    const produtoId = 'produto-1';

    await expect(useCase.aumentarQuantidadeProduto(produtoId, userId)).resolves.toEqual({
      sucesso: true,
    });

    expect(carrinhoGateway.aumentarQuantidadeProduto).toHaveBeenCalledWith(produtoId, userId);
  });

  it('deve diminuir a quantidade de um produto', async () => {
    const produtoId = 'produto-1';

    await expect(useCase.diminuirQuantidadeProduto(produtoId, userId)).resolves.toEqual({
      sucesso: true,
    });

    expect(carrinhoGateway.diminuirQuantidadeProduto).toHaveBeenCalledWith(produtoId, userId);
  });

  it('deve excluir um produto do carrinho', async () => {
    const produtoId = 'produto-1';

    await expect(useCase.excluirProdutoCarrinho(produtoId, userId)).resolves.toEqual({
      sucesso: true,
    });

    expect(carrinhoGateway.excluirProdutoCarrinho).toHaveBeenCalledWith(produtoId, userId);
  });

  it('deve limpar o carrinho do usuário', async () => {
    await expect(useCase.limparCarrinho(userId)).resolves.toEqual({ sucesso: true });

    expect(carrinhoGateway.limparCarrinho).toHaveBeenCalledWith(userId);
  });

  it('deve propagar erros lançados pelo gateway', async () => {
    const error = new Error('Falha na operação');
    vi.mocked(carrinhoGateway.consultarCarrinho).mockRejectedValue(error);

    await expect(useCase.consultarCarrinho(userId)).rejects.toBe(error);
  });
});
