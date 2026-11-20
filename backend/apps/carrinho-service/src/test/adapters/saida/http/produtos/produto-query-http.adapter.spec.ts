
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpException, HttpStatus } from '@nestjs/common';
import type { HttpService } from '@nestjs/axios';
import type { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import type { ProdutoParaCarrinho } from '../../../../../application/ports/saida/produto-query.ports';
import { ProdutoQueryHttpAdapter } from '../../../../../adapters/saida/http/produtos/produto-query-http.adapter';

describe('ProdutoQueryHttpAdapter', () => {
  let adapter: ProdutoQueryHttpAdapter;
  let httpService: { get: ReturnType<typeof vi.fn> };
  let config: { getOrThrow: ReturnType<typeof vi.fn> };

  const produto = { id: '123' } as unknown as ProdutoParaCarrinho;

  beforeEach(() => {
    vi.clearAllMocks();

    httpService = {
      get: vi.fn(),
    };

    config = {
      getOrThrow: vi.fn().mockReturnValue('internal-secret'),
    };

    adapter = new ProdutoQueryHttpAdapter(
      httpService as unknown as HttpService,
      config as unknown as ConfigService,
    );
  });

  describe('buscarPorId', () => {
    it('deve buscar o produto pelo ID e retornar os dados recebidos', async () => {
      httpService.get.mockReturnValue(of({ data: produto }));

      const resultado = await adapter.buscarPorId('123');

      expect(resultado).toBe(produto);
      expect(httpService.get).toHaveBeenCalledWith('/produtos/123', {
        headers: { 'x-internal-key': 'internal-secret' },
      });
      expect(config.getOrThrow).toHaveBeenCalledWith('security.internalApiKey');
    });

    it('deve codificar o ID do produto na URL', async () => {
      httpService.get.mockReturnValue(of({ data: produto }));

      await adapter.buscarPorId('produto/123');

      expect(httpService.get).toHaveBeenCalledWith('/produtos/produto%2F123', {
        headers: { 'x-internal-key': 'internal-secret' },
      });
    });

    it('deve retornar os dados recebidos sem modificá-los', async () => {
      const produtoRecebido = {
        id: '123',
        nome: 'Teclado Gamer',
      } as unknown as ProdutoParaCarrinho;

      httpService.get.mockReturnValue(of({ data: produtoRecebido }));

      const resultado = await adapter.buscarPorId('123');

      expect(resultado).toBe(produtoRecebido);
    });

    it('deve converter erros Axios em HttpException preservando resposta e status', async () => {
      const resposta = { message: 'Produto não encontrado' };
      const erroAxios = Object.assign(new Error('Request failed'), {
        isAxiosError: true,
        response: { data: resposta, status: HttpStatus.NOT_FOUND },
      });

      httpService.get.mockReturnValue(throwError(() => erroAxios));

      try {
        await adapter.buscarPorId('123');
        expect.fail('Era esperado lançar HttpException');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getResponse()).toEqual(resposta);
        expect((error as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('deve utilizar BAD_GATEWAY quando o erro Axios não possuir resposta', async () => {
      const erroAxios = Object.assign(new Error('Network Error'), {
        isAxiosError: true,
      });

      httpService.get.mockReturnValue(throwError(() => erroAxios));

      try {
        await adapter.buscarPorId('123');
        expect.fail('Era esperado lançar HttpException');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getResponse()).toBe('Erro ao consultar produto.');
        expect((error as HttpException).getStatus()).toBe(HttpStatus.BAD_GATEWAY);
      }
    });

    it('deve preservar o status e a resposta quando o status HTTP for 500', async () => {
      const resposta = { message: 'Erro interno no produtos-service' };
      const erroAxios = Object.assign(new Error('Internal Server Error'), {
        isAxiosError: true,
        response: { data: resposta, status: HttpStatus.INTERNAL_SERVER_ERROR },
      });

      httpService.get.mockReturnValue(throwError(() => erroAxios));

      await expect(adapter.buscarPorId('123')).rejects.toMatchObject({
        response: resposta,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });

    it('deve propagar erros que não sejam do Axios', async () => {
      const erro = new Error('Unexpected error');

      httpService.get.mockReturnValue(throwError(() => erro));

      await expect(adapter.buscarPorId('123')).rejects.toBe(erro);
    });

    it('deve propagar erros ao obter a chave interna da configuração', async () => {
      const erro = new Error('Missing internal API key');
      config.getOrThrow.mockImplementation(() => {
        throw erro;
      });

      await expect(adapter.buscarPorId('123')).rejects.toBe(erro);
      expect(httpService.get).not.toHaveBeenCalled();
    });
  });
});
