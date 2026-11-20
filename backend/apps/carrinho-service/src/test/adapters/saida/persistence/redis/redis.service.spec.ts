
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from 'redis';
import type { ConfigService } from '@nestjs/config';
import { RedisService } from '../../../../../adapters/saida/persistence/redis/redis.service';

vi.mock('redis', () => ({
  createClient: vi.fn(),
}));

describe('RedisService', () => {
  let service: RedisService;
  let config: { getOrThrow: ReturnType<typeof vi.fn> };
  let client: {
    isOpen: boolean;
    on: ReturnType<typeof vi.fn>;
    connect: ReturnType<typeof vi.fn>;
    quit: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    config = {
      getOrThrow: vi.fn().mockReturnValue('redis://localhost:6379'),
    };

    client = {
      isOpen: true,
      on: vi.fn<(event: string, listener: (error: Error) => void) => unknown>(),
      connect: vi.fn().mockResolvedValue(undefined),
      quit: vi.fn().mockResolvedValue(undefined),
      get: vi.fn(),
      set: vi.fn().mockResolvedValue(undefined),
      del: vi.fn().mockResolvedValue(1),
    };

vi.mocked(createClient).mockReturnValue(client as never);

    service = new RedisService(config as unknown as ConfigService);
  });

  describe('onModuleInit', () => {
    it('deve criar o client com a URL configurada e conectar ao Redis', async () => {
      await service.onModuleInit();

      expect(config.getOrThrow).toHaveBeenCalledWith('redis.url');
      expect(createClient).toHaveBeenCalledWith({ url: 'redis://localhost:6379' });
      expect(client.connect).toHaveBeenCalledOnce();
    });

    it('deve registrar um listener para erros do Redis', async () => {
      await service.onModuleInit();

      expect(client.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('deve registrar o erro recebido pelo listener', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      await service.onModuleInit();

      const listener = client.on.mock.calls[0][1];
      const error = new Error('Redis connection error');

      listener(error);

      expect(consoleError).toHaveBeenCalledWith('Redis error:', error);

      consoleError.mockRestore();
    });

    it('deve propagar erros durante a conexão', async () => {
      client.connect.mockRejectedValue(new Error('Connection failed'));

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });

    it('deve propagar erros ao obter a URL configurada', async () => {
      config.getOrThrow.mockImplementation(() => {
        throw new Error('Missing Redis URL');
      });

      await expect(service.onModuleInit()).rejects.toThrow('Missing Redis URL');

      expect(createClient).not.toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('deve encerrar a conexão quando o client estiver aberto', async () => {
      await service.onModuleInit();

      await service.onModuleDestroy();

      expect(client.quit).toHaveBeenCalledOnce();
    });

    it('não deve encerrar a conexão quando o client estiver fechado', async () => {
      await service.onModuleInit();
      client.isOpen = false;

      await service.onModuleDestroy();

      expect(client.quit).not.toHaveBeenCalled();
    });

    it('deve propagar erros ao encerrar a conexão', async () => {
      await service.onModuleInit();
      client.quit.mockRejectedValue(new Error('Quit failed'));

      await expect(service.onModuleDestroy()).rejects.toThrow('Quit failed');
    });
  });

  describe('buscar', () => {
    it('deve buscar um valor pela chave informada', async () => {
      await service.onModuleInit();
      client.get.mockResolvedValue('{"usuarioId":"123","itens":[]}');

      const resultado = await service.buscar('carrinho:123');

      expect(client.get).toHaveBeenCalledWith('carrinho:123');
      expect(resultado).toBe('{"usuarioId":"123","itens":[]}');
    });

    it('deve retornar null quando a chave não existir', async () => {
      await service.onModuleInit();
      client.get.mockResolvedValue(null);

      const resultado = await service.buscar('carrinho:123');

      expect(resultado).toBeNull();
    });

    it('deve propagar erros durante a busca', async () => {
      await service.onModuleInit();
      client.get.mockRejectedValue(new Error('Redis get failed'));

      await expect(service.buscar('carrinho:123')).rejects.toThrow('Redis get failed');
    });
  });

  describe('salvar', () => {
    it('deve salvar o valor com o TTL informado', async () => {
      await service.onModuleInit();

      await service.salvar('carrinho:123', '{"itens":[]}', 1800);

      expect(client.set).toHaveBeenCalledWith('carrinho:123', '{"itens":[]}', { EX: 1800 });
    });

    it('deve propagar erros durante a gravação', async () => {
      await service.onModuleInit();
      client.set.mockRejectedValue(new Error('Redis set failed'));

      await expect(service.salvar('carrinho:123', '{"itens":[]}', 1800))
        .rejects.toThrow('Redis set failed');
    });
  });

  describe('remover', () => {
    it('deve remover a chave informada', async () => {
      await service.onModuleInit();

      await service.remover('carrinho:123');

      expect(client.del).toHaveBeenCalledWith('carrinho:123');
    });

    it('deve propagar erros durante a remoção', async () => {
      await service.onModuleInit();
      client.del.mockRejectedValue(new Error('Redis del failed'));

      await expect(service.remover('carrinho:123')).rejects.toThrow('Redis del failed');
    });
  });
});
