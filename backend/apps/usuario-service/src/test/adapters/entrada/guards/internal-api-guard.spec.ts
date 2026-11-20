
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InternalApiGuard } from '../../../../adapters/entrada/http/guards/internal-api-guard';

describe('InternalApiGuard', () => {
  let guard: InternalApiGuard;
  let config: {
    getOrThrow: ReturnType<typeof vi.fn>;
  };
  let context: ExecutionContext;

  const chaveInterna = 'chave-interna-segura';

  beforeEach(() => {
    vi.clearAllMocks();

    config = {
      getOrThrow: vi.fn().mockReturnValue(chaveInterna),
    };

    context = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({
          headers: {
            'x-internal-key': chaveInterna,
          },
        }),
      }),
    } as unknown as ExecutionContext;

    guard = new InternalApiGuard(config as unknown as ConfigService);
  });

  it('deve permitir acesso quando a chave interna for válida', () => {
    expect(guard.canActivate(context)).toBe(true);

    expect(config.getOrThrow).toHaveBeenCalledWith(
      'security.internalApiKey',
    );
  });

  it('deve rejeitar acesso quando a chave recebida for diferente', () => {
    const contexto = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({
          headers: {
            'x-internal-key': 'chave-incorreta',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(contexto)).toThrow(
      UnauthorizedException,
    );

    expect(() => guard.canActivate(contexto)).toThrow(
      'Acesso interno não autorizado.',
    );
  });

  it('deve rejeitar acesso quando o header estiver ausente', () => {
    const contexto = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(contexto)).toThrow(
      UnauthorizedException,
    );
  });

  it('deve rejeitar acesso quando o header não for uma string', () => {
    const contexto = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({
          headers: {
            'x-internal-key': ['chave-1', 'chave-2'],
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(contexto)).toThrow(
      UnauthorizedException,
    );
  });

  it('deve rejeitar acesso quando o tamanho das chaves for diferente', () => {
    const contexto = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({
          headers: {
            'x-internal-key': 'curta',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(contexto)).toThrow(
      UnauthorizedException,
    );
  });

  it('deve propagar erro quando a chave interna não estiver configurada', () => {
    config.getOrThrow.mockImplementation(() => {
      throw new Error('Chave interna não configurada');
    });

    expect(() => guard.canActivate(context)).toThrow(
      'Chave interna não configurada',
    );
  });
});
