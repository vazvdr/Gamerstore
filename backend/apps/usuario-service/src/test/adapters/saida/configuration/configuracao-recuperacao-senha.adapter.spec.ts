
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { ConfiguracaoRecuperacaoSenhaAdapter } from '../../../../adapters/saida/configuration/configuracao-recuperacao-senha.adapter';

describe('ConfiguracaoRecuperacaoSenhaAdapter', () => {
  let adapter: ConfiguracaoRecuperacaoSenhaAdapter;
  let config: {
    getOrThrow: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    config = {
      getOrThrow: vi.fn(),
    };

    adapter = new ConfiguracaoRecuperacaoSenhaAdapter(
      config as unknown as ConfigService,
    );
  });

  describe('obterTtl', () => {
    it('deve retornar o TTL configurado para recuperação de senha', () => {
      config.getOrThrow.mockReturnValue(900);

      expect(adapter.obterTtl()).toBe(900);

      expect(config.getOrThrow).toHaveBeenCalledWith(
        'passwordReset.ttl',
      );
    });

    it('deve propagar o erro quando o TTL não estiver configurado', () => {
      config.getOrThrow.mockImplementation(() => {
        throw new Error('Configuração passwordReset.ttl não encontrada');
      });

      expect(() => adapter.obterTtl()).toThrow(
        'Configuração passwordReset.ttl não encontrada',
      );
    });
  });

  describe('obterUrlFrontend', () => {
    it('deve retornar a URL configurada do frontend', () => {
      config.getOrThrow.mockReturnValue('https://gamerstore.com.br');

      expect(adapter.obterUrlFrontend()).toBe(
        'https://gamerstore.com.br',
      );

      expect(config.getOrThrow).toHaveBeenCalledWith('frontend.url');
    });

    it('deve propagar o erro quando a URL do frontend não estiver configurada', () => {
      config.getOrThrow.mockImplementation(() => {
        throw new Error('Configuração frontend.url não encontrada');
      });

      expect(() => adapter.obterUrlFrontend()).toThrow(
        'Configuração frontend.url não encontrada',
      );
    });
  });
});
