
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { RedisService } from '../../../../../adapters/saida/persistence/redis/redis.service';
import type { ConfigService } from '@nestjs/config';

const redisMocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  on: vi.fn(),
  connect: vi.fn(),
  quit: vi.fn(),
  set: vi.fn(),
  eval: vi.fn(),
  get: vi.fn(),
  incr: vi.fn(),
  expire: vi.fn(),
  ttl: vi.fn(),
  del: vi.fn(),
}));

vi.mock('redis', () => ({
  createClient: redisMocks.createClient,
}));

describe('RedisService', () => {
  let service: RedisService;
  let config: ConfigService;
  let client: {
    on: typeof redisMocks.on;
    connect: typeof redisMocks.connect;
    quit: typeof redisMocks.quit;
    set: typeof redisMocks.set;
    eval: typeof redisMocks.eval;
    get: typeof redisMocks.get;
    incr: typeof redisMocks.incr;
    expire: typeof redisMocks.expire;
    ttl: typeof redisMocks.ttl;
    del: typeof redisMocks.del;
    isOpen: boolean;
  };

  const hash = (value: string) =>
    createHash('sha256').update(value).digest('hex');

  const refreshKey = (token: string) => `refresh-token:${hash(token)}`;
  const loginKey = (type: 'attempts' | 'block', ip: string) =>
    `login:${type}:${hash(ip)}`;

  beforeEach(() => {
    vi.clearAllMocks();

    client = {
      on: redisMocks.on,
      connect: redisMocks.connect,
      quit: redisMocks.quit,
      set: redisMocks.set,
      eval: redisMocks.eval,
      get: redisMocks.get,
      incr: redisMocks.incr,
      expire: redisMocks.expire,
      ttl: redisMocks.ttl,
      del: redisMocks.del,
      isOpen: true,
    };

    redisMocks.createClient.mockReturnValue(client);
    redisMocks.connect.mockResolvedValue(undefined);
    redisMocks.quit.mockResolvedValue('OK');

    config = {
      getOrThrow: vi.fn().mockReturnValue('redis://localhost:6379'),
    } as unknown as ConfigService;

    service = new RedisService(config);
  });

  describe('onModuleInit', () => {
    it('deve criar o cliente Redis com a URL configurada e conectar', async () => {
      await service.onModuleInit();

      expect(config.getOrThrow).toHaveBeenCalledWith('redis.url');
      expect(redisMocks.createClient).toHaveBeenCalledWith({
        url: 'redis://localhost:6379',
      });
      expect(client.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(client.connect).toHaveBeenCalledOnce();
    });

    it('deve registrar erros do Redis no console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await service.onModuleInit();

      const handler = client.on.mock.calls[0][1];
      const erro = new Error('Redis indisponível');

      handler(erro);

      expect(consoleSpy).toHaveBeenCalledWith('Redis error:', erro);

      consoleSpy.mockRestore();
    });

    it('deve propagar erros durante a conexão', async () => {
      const erro = new Error('Falha na conexão');
      redisMocks.connect.mockRejectedValueOnce(erro);

      await expect(service.onModuleInit()).rejects.toThrow(erro);
    });

    it('deve propagar erros ao obter a URL configurada', async () => {
      vi.mocked(config.getOrThrow).mockImplementation(() => {
        throw new Error('Configuração não encontrada');
      });

      await expect(service.onModuleInit()).rejects.toThrow(
        'Configuração não encontrada',
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('deve encerrar a conexão quando o cliente estiver aberto', async () => {
      await service.onModuleInit();
      await service.onModuleDestroy();

      expect(client.quit).toHaveBeenCalledOnce();
    });

    it('não deve encerrar a conexão quando o cliente estiver fechado', async () => {
      await service.onModuleInit();
      client.isOpen = false;

      await service.onModuleDestroy();

      expect(client.quit).not.toHaveBeenCalled();
    });

    it('deve propagar erros durante o encerramento', async () => {
      await service.onModuleInit();

      const erro = new Error('Falha ao encerrar conexão');
      redisMocks.quit.mockRejectedValueOnce(erro);

      await expect(service.onModuleDestroy()).rejects.toThrow(erro);
    });
  });

  describe('registrarRefreshToken', () => {
    it('deve registrar o refresh token com TTL de sete dias e NX', async () => {
      redisMocks.set.mockResolvedValue('OK');
      await service.onModuleInit();

      const resultado = await service.registrarRefreshToken(
        'token-atual',
        'usuario-1',
      );

      expect(client.set).toHaveBeenCalledWith(
        refreshKey('token-atual'),
        'usuario-1',
        { EX: 604800, NX: true },
      );
      expect(resultado).toBe(true);
    });

    it('deve retornar false quando o token já estiver registrado', async () => {
      redisMocks.set.mockResolvedValue(null);
      await service.onModuleInit();

      const resultado = await service.registrarRefreshToken(
        'token-atual',
        'usuario-1',
      );

      expect(resultado).toBe(false);
    });

    it('deve propagar erros do Redis', async () => {
      const erro = new Error('Falha ao registrar token');
      redisMocks.set.mockRejectedValueOnce(erro);
      await service.onModuleInit();

      await expect(
        service.registrarRefreshToken('token-atual', 'usuario-1'),
      ).rejects.toThrow(erro);
    });
  });

  describe('rotacionarRefreshToken', () => {
    it('deve executar a rotação e retornar o resultado numérico', async () => {
      redisMocks.eval.mockResolvedValue(1);
      await service.onModuleInit();

      const resultado = await service.rotacionarRefreshToken(
        'token-antigo',
        'token-novo',
        'usuario-1',
      );

      expect(client.eval).toHaveBeenCalledWith(
        expect.stringContaining("redis.call('GET', KEYS[1])"),
        {
          keys: [
            refreshKey('token-antigo'),
            refreshKey('token-novo'),
          ],
          arguments: ['usuario-1', '604800'],
        },
      );
      expect(resultado).toBe(1);
    });

    it.each([
      [0, 'token inexistente'],
      [-1, 'token novo já registrado'],
      [-2, 'usuário do token diferente'],
    ])('deve retornar %i quando ocorrer %s', async (resposta) => {
      redisMocks.eval.mockResolvedValue(resposta);
      await service.onModuleInit();

      const resultado = await service.rotacionarRefreshToken(
        'token-antigo',
        'token-novo',
        'usuario-1',
      );

      expect(resultado).toBe(resposta);
    });

    it('deve converter a resposta para número', async () => {
      redisMocks.eval.mockResolvedValue('1');
      await service.onModuleInit();

      const resultado = await service.rotacionarRefreshToken(
        'token-antigo',
        'token-novo',
        'usuario-1',
      );

      expect(resultado).toBe(1);
    });

    it('deve propagar erros do Redis', async () => {
      const erro = new Error('Falha na rotação');
      redisMocks.eval.mockRejectedValueOnce(erro);
      await service.onModuleInit();

      await expect(
        service.rotacionarRefreshToken(
          'token-antigo',
          'token-novo',
          'usuario-1',
        ),
      ).rejects.toThrow(erro);
    });
  });

  describe('registrarTokenRecuperacao', () => {
    it('deve registrar o token de recuperação com TTL e NX', async () => {
      redisMocks.set.mockResolvedValue('OK');
      await service.onModuleInit();

      const resultado = await service.registrarTokenRecuperacao(
        'hash-token',
        'usuario-1',
        900,
      );

      expect(client.set).toHaveBeenCalledWith(
        'password-reset:hash-token',
        'usuario-1',
        { EX: 900, NX: true },
      );
      expect(resultado).toBe(true);
    });

    it('deve retornar false quando o token já existir', async () => {
      redisMocks.set.mockResolvedValue(null);
      await service.onModuleInit();

      const resultado = await service.registrarTokenRecuperacao(
        'hash-token',
        'usuario-1',
        900,
      );

      expect(resultado).toBe(false);
    });

    it('deve propagar erros do Redis', async () => {
      const erro = new Error('Falha ao registrar recuperação');
      redisMocks.set.mockRejectedValueOnce(erro);
      await service.onModuleInit();

      await expect(
        service.registrarTokenRecuperacao('hash-token', 'usuario-1', 900),
      ).rejects.toThrow(erro);
    });
  });

  describe('buscarTokenRecuperacao', () => {
    it('deve buscar o token de recuperação pela chave', async () => {
      redisMocks.get.mockResolvedValue('usuario-1');
      await service.onModuleInit();

      const resultado = await service.buscarTokenRecuperacao('hash-token');

      expect(client.get).toHaveBeenCalledWith('password-reset:hash-token');
      expect(resultado).toBe('usuario-1');
    });

    it('deve retornar null quando o token não existir', async () => {
      redisMocks.get.mockResolvedValue(null);
      await service.onModuleInit();

      const resultado = await service.buscarTokenRecuperacao('inexistente');

      expect(resultado).toBeNull();
    });

    it('deve propagar erros do Redis', async () => {
      const erro = new Error('Falha ao buscar token');
      redisMocks.get.mockRejectedValueOnce(erro);
      await service.onModuleInit();

      await expect(
        service.buscarTokenRecuperacao('hash-token'),
      ).rejects.toThrow(erro);
    });
  });

  describe('consumirTokenRecuperacao', () => {
    it('deve retornar true quando o token for consumido', async () => {
      redisMocks.eval.mockResolvedValue(1);
      await service.onModuleInit();

      const resultado = await service.consumirTokenRecuperacao(
        'hash-token',
        'usuario-1',
      );

      expect(client.eval).toHaveBeenCalledWith(
        expect.stringContaining("redis.call('DEL', KEYS[1])"),
        {
          keys: ['password-reset:hash-token'],
          arguments: ['usuario-1'],
        },
      );
      expect(resultado).toBe(true);
    });

    it('deve retornar false quando o token não pertencer ao usuário', async () => {
      redisMocks.eval.mockResolvedValue(0);
      await service.onModuleInit();

      const resultado = await service.consumirTokenRecuperacao(
        'hash-token',
        'outro-usuario',
      );

      expect(resultado).toBe(false);
    });

    it('deve retornar false quando o token não existir', async () => {
      redisMocks.eval.mockResolvedValue(0);
      await service.onModuleInit();

      const resultado = await service.consumirTokenRecuperacao(
        'inexistente',
        'usuario-1',
      );

      expect(resultado).toBe(false);
    });

    it('deve propagar erros do Redis', async () => {
      const erro = new Error('Falha ao consumir token');
      redisMocks.eval.mockRejectedValueOnce(erro);
      await service.onModuleInit();

      await expect(
        service.consumirTokenRecuperacao('hash-token', 'usuario-1'),
      ).rejects.toThrow(erro);
    });
  });

  describe('operações genéricas', () => {
    it('incrementar deve retornar o resultado do Redis', async () => {
      redisMocks.incr.mockResolvedValue(2);
      await service.onModuleInit();

      await expect(service.incrementar('chave')).resolves.toBe(2);
      expect(client.incr).toHaveBeenCalledWith('chave');
    });

    it('incrementar deve propagar erros', async () => {
      const erro = new Error('Falha no incremento');
      redisMocks.incr.mockRejectedValueOnce(erro);
      await service.onModuleInit();

      await expect(service.incrementar('chave')).rejects.toThrow(erro);
    });

    it('expirar deve retornar o resultado do Redis', async () => {
      redisMocks.expire.mockResolvedValue(true);
      await service.onModuleInit();

      await expect(service.expirar('chave', 60)).resolves.toBe(true);
      expect(client.expire).toHaveBeenCalledWith('chave', 60);
    });

    it('expirar deve propagar erros', async () => {
      const erro = new Error('Falha ao expirar');
      redisMocks.expire.mockRejectedValueOnce(erro);
      await service.onModuleInit();

      await expect(service.expirar('chave', 60)).rejects.toThrow(erro);
    });

    it('ttl deve retornar o resultado do Redis', async () => {
      redisMocks.ttl.mockResolvedValue(120);
      await service.onModuleInit();

      await expect(service.ttl('chave')).resolves.toBe(120);
      expect(client.ttl).toHaveBeenCalledWith('chave');
    });

    it('ttl deve propagar erros', async () => {
      const erro = new Error('Falha ao consultar TTL');
      redisMocks.ttl.mockRejectedValueOnce(erro);
      await service.onModuleInit();

      await expect(service.ttl('chave')).rejects.toThrow(erro);
    });

    it('deletar deve retornar a quantidade de chaves removidas', async () => {
      redisMocks.del.mockResolvedValue(1);
      await service.onModuleInit();

      await expect(service.deletar('chave')).resolves.toBe(1);
      expect(client.del).toHaveBeenCalledWith('chave');
    });

    it('deletar deve propagar erros', async () => {
      const erro = new Error('Falha ao deletar');
      redisMocks.del.mockRejectedValueOnce(erro);
      await service.onModuleInit();

      await expect(service.deletar('chave')).rejects.toThrow(erro);
    });
  });

  describe('consultarBloqueioLogin', () => {
    it('deve retornar o TTL quando o IP estiver bloqueado', async () => {
      redisMocks.ttl.mockResolvedValue(300);
      await service.onModuleInit();

      const resultado = await service.consultarBloqueioLogin('192.168.0.1');

      expect(client.ttl).toHaveBeenCalledWith(
        loginKey('block', '192.168.0.1'),
      );
      expect(resultado).toBe(300);
    });

    it.each([0, -1, -2])(
      'deve retornar zero quando o TTL for %i',
      async (ttl) => {
        redisMocks.ttl.mockResolvedValue(ttl);
        await service.onModuleInit();

        const resultado = await service.consultarBloqueioLogin(
          '192.168.0.1',
        );

        expect(resultado).toBe(0);
      },
    );

    it('deve propagar erros do Redis', async () => {
      const erro = new Error('Falha ao consultar bloqueio');
      redisMocks.ttl.mockRejectedValueOnce(erro);
      await service.onModuleInit();

      await expect(
        service.consultarBloqueioLogin('192.168.0.1'),
      ).rejects.toThrow(erro);
    });
  });

  describe('registrarFalhaLogin', () => {
    it('deve registrar uma tentativa sem bloquear o IP', async () => {
      redisMocks.eval.mockResolvedValue([1, 2, 0]);
      await service.onModuleInit();

      const resultado = await service.registrarFalhaLogin(
        '192.168.0.1',
        5,
        300,
      );

      expect(client.eval).toHaveBeenCalledWith(
        expect.stringContaining("redis.call('INCR', KEYS[2])"),
        {
          keys: [
            loginKey('block', '192.168.0.1'),
            loginKey('attempts', '192.168.0.1'),
          ],
          arguments: ['5', '300'],
        },
      );

      expect(resultado).toEqual({
        bloqueado: false,
        tentativas: 2,
        tempoRestante: 0,
      });
    });

    it('deve retornar bloqueado quando atingir o limite de tentativas', async () => {
      redisMocks.eval.mockResolvedValue([0, 5, 300]);
      await service.onModuleInit();

      const resultado = await service.registrarFalhaLogin(
        '192.168.0.1',
        5,
        300,
      );

      expect(resultado).toEqual({
        bloqueado: true,
        tentativas: 5,
        tempoRestante: 300,
      });
    });

    it('deve retornar o bloqueio existente sem incrementar tentativas', async () => {
      redisMocks.eval.mockResolvedValue([0, 0, 180]);
      await service.onModuleInit();

      const resultado = await service.registrarFalhaLogin(
        '192.168.0.1',
        5,
        300,
      );

      expect(resultado).toEqual({
        bloqueado: true,
        tentativas: 0,
        tempoRestante: 180,
      });
    });

    it('deve converter os valores retornados pelo Redis para número', async () => {
      redisMocks.eval.mockResolvedValue(['0', '5', '300']);
      await service.onModuleInit();

      const resultado = await service.registrarFalhaLogin(
        '192.168.0.1',
        5,
        300,
      );

      expect(resultado).toEqual({
        bloqueado: true,
        tentativas: 5,
        tempoRestante: 300,
      });
    });

    it('deve lançar erro quando o Redis retornar uma resposta inválida', async () => {
      redisMocks.eval.mockResolvedValue('resposta-invalida');
      await service.onModuleInit();

      await expect(
        service.registrarFalhaLogin('192.168.0.1', 5, 300),
      ).rejects.toThrow(
        'Resposta inválida ao registrar tentativa de login.',
      );
    });

    it('deve propagar erros do Redis', async () => {
      const erro = new Error('Falha ao registrar tentativa');
      redisMocks.eval.mockRejectedValueOnce(erro);
      await service.onModuleInit();

      await expect(
        service.registrarFalhaLogin('192.168.0.1', 5, 300),
      ).rejects.toThrow(erro);
    });
  });

  describe('limparTentativasLogin', () => {
    it('deve remover as chaves de tentativas e bloqueio do IP', async () => {
      redisMocks.del.mockResolvedValue(2);
      await service.onModuleInit();

      await service.limparTentativasLogin('192.168.0.1');

      expect(client.del).toHaveBeenCalledWith([
        loginKey('attempts', '192.168.0.1'),
        loginKey('block', '192.168.0.1'),
      ]);
    });

    it('deve propagar erros do Redis', async () => {
      const erro = new Error('Falha ao limpar tentativas');
      redisMocks.del.mockRejectedValueOnce(erro);
      await service.onModuleInit();

      await expect(
        service.limparTentativasLogin('192.168.0.1'),
      ).rejects.toThrow(erro);
    });
  });
});
