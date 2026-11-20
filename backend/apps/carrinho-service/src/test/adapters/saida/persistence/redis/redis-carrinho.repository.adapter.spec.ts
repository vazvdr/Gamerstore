import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConfigService } from '@nestjs/config';
import { RedisCarrinhoRepositoryAdapter } from '../../../../../adapters/saida/persistence/redis/redis-carrinho-repository.adapter';
import type { RedisService } from '../../../../../adapters/saida/persistence/redis/redis.service';
import type { Carrinho } from '../../../../../domain/entities/carrinho';

describe('RedisCarrinhoRepositoryAdapter', () => {
  let adapter: RedisCarrinhoRepositoryAdapter;
  let redisService: RedisService;
  let config: ConfigService;

  const buscar = vi.fn();
  const salvar = vi.fn();
  const remover = vi.fn();
  const getOrThrow = vi.fn();

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
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    redisService = {
      buscar,
      salvar,
      remover,
    } as unknown as RedisService;

    config = {
      getOrThrow,
    } as unknown as ConfigService;

    adapter = new RedisCarrinhoRepositoryAdapter(redisService, config);
  });

  describe('buscarPorUsuarioId', () => {
    it('deve buscar o carrinho utilizando a chave do usuário', async () => {
      buscar.mockResolvedValue(null);

      await adapter.buscarPorUsuarioId('usuario-1');

      expect(buscar).toHaveBeenCalledOnce();
      expect(buscar).toHaveBeenCalledWith('carrinho:usuario-1');
    });

    it('deve retornar um carrinho vazio quando não encontrar dados no Redis', async () => {
      buscar.mockResolvedValue(null);

      const resultado = await adapter.buscarPorUsuarioId('usuario-1');

      expect(resultado).toEqual({
        usuarioId: 'usuario-1',
        itens: [],
      });
    });

    it('deve desserializar e retornar o carrinho encontrado no Redis', async () => {
      buscar.mockResolvedValue(JSON.stringify(carrinho));

      const resultado = await adapter.buscarPorUsuarioId('usuario-1');

      expect(resultado).toEqual(carrinho);
    });

    it('deve propagar erros lançados pelo Redis', async () => {
      const erro = new Error('Falha ao buscar carrinho no Redis');

      buscar.mockRejectedValue(erro);

      await expect(adapter.buscarPorUsuarioId('usuario-1')).rejects.toBe(erro);
    });

    it('deve propagar erros de JSON inválido', async () => {
      buscar.mockResolvedValue('{json-invalido}');

      await expect(adapter.buscarPorUsuarioId('usuario-1')).rejects.toThrow();
    });
  });

  describe('salvar', () => {
    it('deve salvar o carrinho serializado utilizando a chave e o TTL configurado', async () => {
      getOrThrow.mockReturnValue(3600);
      salvar.mockResolvedValue(undefined);

      await adapter.salvar(carrinho);

      expect(getOrThrow).toHaveBeenCalledOnce();
      expect(getOrThrow).toHaveBeenCalledWith('redis.carrinhoTtl');
      expect(salvar).toHaveBeenCalledOnce();
      expect(salvar).toHaveBeenCalledWith(
        'carrinho:usuario-1',
        JSON.stringify(carrinho),
        3600,
      );
    });

    it('deve propagar erros lançados pelo Redis ao salvar', async () => {
      const erro = new Error('Falha ao salvar carrinho no Redis');

      getOrThrow.mockReturnValue(3600);
      salvar.mockRejectedValue(erro);

      await expect(adapter.salvar(carrinho)).rejects.toBe(erro);
    });

    it('deve propagar erros ao obter o TTL da configuração', async () => {
      const erro = new Error('Configuração redis.carrinhoTtl não encontrada');

      getOrThrow.mockImplementation(() => {
        throw erro;
      });

      await expect(adapter.salvar(carrinho)).rejects.toBe(erro);

      expect(salvar).not.toHaveBeenCalled();
    });
  });

  describe('limpar', () => {
    it('deve remover a chave do carrinho correspondente ao usuário', async () => {
      remover.mockResolvedValue(undefined);

      await adapter.limpar('usuario-1');

      expect(remover).toHaveBeenCalledOnce();
      expect(remover).toHaveBeenCalledWith('carrinho:usuario-1');
    });

    it('deve propagar erros lançados pelo Redis ao remover o carrinho', async () => {
      const erro = new Error('Falha ao remover carrinho no Redis');

      remover.mockRejectedValue(erro);

      await expect(adapter.limpar('usuario-1')).rejects.toBe(erro);
    });
  });
});
