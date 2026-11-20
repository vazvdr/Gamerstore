import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProdutosUseCase } from '../../usecases/produtos.usecase';
import { ProdutosGatewayPort } from '../../application/ports/saida/produtos-gateway.ports';

describe('ProdutosUseCase', () => {
  let useCase: ProdutosUseCase;
  let produtosGateway: ProdutosGatewayPort;

  beforeEach(() => {
    produtosGateway = {
      listarProdutos: vi.fn().mockResolvedValue([]),
      listarProdutosPorId: vi.fn().mockResolvedValue({ id: 'produto-1' }),
    };

    useCase = new ProdutosUseCase(produtosGateway);
  });

  describe('listarProdutos', () => {
    it('deve listar os produtos através do gateway', async () => {
      await expect(useCase.listarProdutos()).resolves.toEqual([]);

      expect(produtosGateway.listarProdutos).toHaveBeenCalledOnce();
    });

    it('deve retornar os dados recebidos do gateway', async () => {
      const produtos = [{ id: 'produto-1', nome: 'Notebook Gamer' }];
      vi.mocked(produtosGateway.listarProdutos).mockResolvedValue(produtos);

      await expect(useCase.listarProdutos()).resolves.toEqual(produtos);
    });

    it('deve propagar erros lançados pelo gateway', async () => {
      const error = new Error('Falha ao listar produtos');
      vi.mocked(produtosGateway.listarProdutos).mockRejectedValue(error);

      await expect(useCase.listarProdutos()).rejects.toBe(error);
    });
  });

  describe('listarProdutosPorId', () => {
    it('deve buscar um produto pelo ID através do gateway', async () => {
      await expect(useCase.listarProdutosPorId('produto-1')).resolves.toEqual({
        id: 'produto-1',
      });

      expect(produtosGateway.listarProdutosPorId).toHaveBeenCalledWith('produto-1');
    });

    it('deve retornar os dados recebidos do gateway', async () => {
      const produto = { id: 'produto-2', nome: 'Mouse Gamer' };
      vi.mocked(produtosGateway.listarProdutosPorId).mockResolvedValue(produto);

      await expect(useCase.listarProdutosPorId('produto-2')).resolves.toEqual(produto);
    });

    it('deve propagar erros lançados pelo gateway', async () => {
      const error = new Error('Falha ao buscar produto');
      vi.mocked(produtosGateway.listarProdutosPorId).mockRejectedValue(error);

      await expect(useCase.listarProdutosPorId('produto-1')).rejects.toBe(error);
    });
  });
});
