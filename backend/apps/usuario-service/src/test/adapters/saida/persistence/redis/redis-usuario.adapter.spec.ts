
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RedisUsuarioAdapter } from '../../../../../adapters/saida/persistence/redis/redis-usuario.adapter';
import { RedisService } from '../../../../../adapters/saida/persistence/redis/redis.service';

describe('RedisUsuarioAdapter', () => {
  let adapter: RedisUsuarioAdapter;

  const redis = {
    registrarRefreshToken: vi.fn(),
    rotacionarRefreshToken: vi.fn(),
    registrarTokenRecuperacao: vi.fn(),
    buscarTokenRecuperacao: vi.fn(),
    consumirTokenRecuperacao: vi.fn(),
    consultarBloqueioLogin: vi.fn(),
    registrarFalhaLogin: vi.fn(),
    limparTentativasLogin: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new RedisUsuarioAdapter(redis as unknown as RedisService);
  });

  describe('registrarRefreshToken', () => {
    it('deve encaminhar os dados e retornar true quando registrar o token', async () => {
      redis.registrarRefreshToken.mockResolvedValue(true);

      await expect(
        adapter.registrarRefreshToken('refresh-token', 'usuario-1'),
      ).resolves.toBe(true);

      expect(redis.registrarRefreshToken).toHaveBeenCalledWith(
        'refresh-token',
        'usuario-1',
      );
    });

    it('deve retornar false quando o registro falhar', async () => {
      redis.registrarRefreshToken.mockResolvedValue(false);

      await expect(
        adapter.registrarRefreshToken('refresh-token', 'usuario-1'),
      ).resolves.toBe(false);
    });
  });

  describe('rotacionarRefreshToken', () => {
    it('deve encaminhar os dados e retornar o resultado da rotação', async () => {
      redis.rotacionarRefreshToken.mockResolvedValue(1);

      await expect(
        adapter.rotacionarRefreshToken(
          'token-atual',
          'novo-token',
          'usuario-1',
        ),
      ).resolves.toBe(1);

      expect(redis.rotacionarRefreshToken).toHaveBeenCalledWith(
        'token-atual',
        'novo-token',
        'usuario-1',
      );
    });

    it('deve retornar zero quando a rotação não ocorrer', async () => {
      redis.rotacionarRefreshToken.mockResolvedValue(0);

      await expect(
        adapter.rotacionarRefreshToken(
          'token-atual',
          'novo-token',
          'usuario-1',
        ),
      ).resolves.toBe(0);
    });
  });

  describe('registrar', () => {
    it('deve registrar o token de recuperação e retornar true', async () => {
      redis.registrarTokenRecuperacao.mockResolvedValue(true);

      await expect(
        adapter.registrar('token-hash', 'usuario-1', 900),
      ).resolves.toBe(true);

      expect(redis.registrarTokenRecuperacao).toHaveBeenCalledWith(
        'token-hash',
        'usuario-1',
        900,
      );
    });

    it('deve retornar false quando o registro não for realizado', async () => {
      redis.registrarTokenRecuperacao.mockResolvedValue(false);

      await expect(
        adapter.registrar('token-hash', 'usuario-1', 900),
      ).resolves.toBe(false);
    });
  });

  describe('buscar', () => {
    it('deve retornar o usuário associado ao token', async () => {
      redis.buscarTokenRecuperacao.mockResolvedValue('usuario-1');

      await expect(
        adapter.buscar('token-hash'),
      ).resolves.toBe('usuario-1');

      expect(redis.buscarTokenRecuperacao).toHaveBeenCalledWith('token-hash');
    });

    it('deve retornar null quando o token não existir', async () => {
      redis.buscarTokenRecuperacao.mockResolvedValue(null);

      await expect(
        adapter.buscar('token-inexistente'),
      ).resolves.toBeNull();
    });
  });

  describe('consumir', () => {
    it('deve consumir o token de recuperação e retornar true', async () => {
      redis.consumirTokenRecuperacao.mockResolvedValue(true);

      await expect(
        adapter.consumir('token-hash', 'usuario-1'),
      ).resolves.toBe(true);

      expect(redis.consumirTokenRecuperacao).toHaveBeenCalledWith(
        'token-hash',
        'usuario-1',
      );
    });

    it('deve retornar false quando o token não puder ser consumido', async () => {
      redis.consumirTokenRecuperacao.mockResolvedValue(false);

      await expect(
        adapter.consumir('token-hash', 'usuario-1'),
      ).resolves.toBe(false);
    });
  });

  describe('consultarBloqueio', () => {
    it('deve retornar o tempo restante de bloqueio do IP', async () => {
      redis.consultarBloqueioLogin.mockResolvedValue(300);

      await expect(
        adapter.consultarBloqueio('127.0.0.1'),
      ).resolves.toBe(300);

      expect(redis.consultarBloqueioLogin).toHaveBeenCalledWith('127.0.0.1');
    });

    it('deve retornar zero quando o IP não estiver bloqueado', async () => {
      redis.consultarBloqueioLogin.mockResolvedValue(0);

      await expect(
        adapter.consultarBloqueio('127.0.0.1'),
      ).resolves.toBe(0);
    });
  });

  describe('registrarFalha', () => {
    it('deve registrar uma falha e retornar o resultado', async () => {
      const resultado = {
        bloqueado: false,
        tentativasRestantes: 2,
      };

      redis.registrarFalhaLogin.mockResolvedValue(resultado);

      await expect(
        adapter.registrarFalha('127.0.0.1', 3, 900),
      ).resolves.toEqual(resultado);

      expect(redis.registrarFalhaLogin).toHaveBeenCalledWith(
        '127.0.0.1',
        3,
        900,
      );
    });

    it('deve retornar o resultado quando o IP for bloqueado', async () => {
      const resultado = {
        bloqueado: true,
        tentativasRestantes: 0,
      };

      redis.registrarFalhaLogin.mockResolvedValue(resultado);

      await expect(
        adapter.registrarFalha('127.0.0.1', 3, 900),
      ).resolves.toEqual(resultado);
    });
  });

  describe('limparTentativas', () => {
    it('deve encaminhar o IP para limpar as tentativas de login', async () => {
      redis.limparTentativasLogin.mockResolvedValue(undefined);

      await expect(
        adapter.limparTentativas('127.0.0.1'),
      ).resolves.toBeUndefined();

      expect(redis.limparTentativasLogin).toHaveBeenCalledWith('127.0.0.1');
    });
  });
});
