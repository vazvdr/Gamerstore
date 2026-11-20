import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { InternalApiGuard } from '../../../../adapters/entrada/guards/internal-api.guards';

describe('InternalApiGuard', () => {
  let guard: InternalApiGuard;
  let config: { getOrThrow: ReturnType<typeof vi.fn> };

  const criarContext = (headers: Record<string, string | undefined>) => {
    const request: { headers: Record<string, string | undefined>; user?: { id: string } } = { headers };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    };

    return { context: context as unknown as ExecutionContext, request };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    config = {
      getOrThrow: vi.fn().mockReturnValue('internal-secret'),
    };

    guard = new InternalApiGuard(config as unknown as ConfigService);
  });

  it('deve autorizar a requisição com chave interna e usuário válidos', () => {
    const { context, request } = criarContext({
      'x-internal-key': 'internal-secret',
      'x-user-id': 'usuario-123',
    });

    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toEqual({ id: 'usuario-123' });
    expect(config.getOrThrow).toHaveBeenCalledWith('security.internalApiKey');
  });

  it('deve lançar UnauthorizedException quando a chave interna for inválida', () => {
    const { context } = criarContext({
      'x-internal-key': 'wrong-secret',
      'x-user-id': 'usuario-123',
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow('Chave interna inválida.');
  });

  it('deve lançar UnauthorizedException quando a chave interna estiver ausente', () => {
    const { context } = criarContext({
      'x-user-id': 'usuario-123',
    });

    expect(() => guard.canActivate(context)).toThrow('Chave interna inválida.');
  });

  it('deve lançar UnauthorizedException quando o ID do usuário estiver ausente', () => {
    const { context } = criarContext({
      'x-internal-key': 'internal-secret',
    });

    expect(() => guard.canActivate(context)).toThrow('Usuário não identificado.');
  });

  it('deve lançar UnauthorizedException quando o ID do usuário estiver vazio', () => {
    const { context } = criarContext({
      'x-internal-key': 'internal-secret',
      'x-user-id': '',
    });

    expect(() => guard.canActivate(context)).toThrow('Usuário não identificado.');
  });

  it('deve lançar UnauthorizedException quando o ID do usuário contiver apenas espaços', () => {
    const { context } = criarContext({
      'x-internal-key': 'internal-secret',
      'x-user-id': '   ',
    });

    expect(() => guard.canActivate(context)).toThrow('Usuário não identificado.');
  });

  it('deve propagar erros ao obter a chave interna da configuração', () => {
    const erro = new Error('Missing internal API key');
    config.getOrThrow.mockImplementation(() => {
      throw erro;
    });

    const { context } = criarContext({
      'x-internal-key': 'internal-secret',
      'x-user-id': 'usuario-123',
    });

    expect(() => guard.canActivate(context)).toThrow(erro);
  });
});
