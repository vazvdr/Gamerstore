
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../guards/jwt-auth-guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  let config: ConfigService;

  let request: {
    headers: { authorization?: string };
    user?: Record<string, unknown>;
  };

  let context: ExecutionContext;

  beforeEach(() => {
    request = {
      headers: {},
    };

    context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    jwtService = {
      verifyAsync: vi.fn().mockResolvedValue({
        sub: 'user-123',
        email: 'joazinho@example.com',
        type: 'access',
      }),
    } as unknown as JwtService;

    config = {
      getOrThrow: vi.fn().mockReturnValue('access-secret'),
    } as unknown as ConfigService;

    guard = new JwtAuthGuard(jwtService, config);
  });

  it('deve rejeitar requisição sem token', async () => {
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token não informado.'),
    );

    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('deve rejeitar autorização com tipo diferente de Bearer', async () => {
    request.headers.authorization = 'Basic token-123';

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token inválido.'),
    );

    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('deve rejeitar autorização sem token', async () => {
    request.headers.authorization = 'Bearer';

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token inválido.'),
    );

    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('deve validar o token e adicionar o payload à requisição', async () => {
    request.headers.authorization = 'Bearer access-token';

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('access-token', {
      secret: 'access-secret',
      algorithms: ['HS256'],
    });

    expect(config.getOrThrow).toHaveBeenCalledWith('JWT_ACCESS_SECRET');

    expect(request.user).toEqual({
      sub: 'user-123',
      email: 'joazinho@example.com',
      type: 'access',
    });
  });

  it('deve rejeitar token do tipo refresh', async () => {
    request.headers.authorization = 'Bearer refresh-token';

    vi.mocked(jwtService.verifyAsync).mockResolvedValue({
      sub: 'user-123',
      type: 'refresh',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token inválido ou expirado.'),
    );
  });

  it('deve rejeitar payload sem sub', async () => {
    request.headers.authorization = 'Bearer access-token';

    vi.mocked(jwtService.verifyAsync).mockResolvedValue({
      email: 'joazinho@example.com',
      type: 'access',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token inválido ou expirado.'),
    );
  });

  it('deve rejeitar payload com sub vazio', async () => {
    request.headers.authorization = 'Bearer access-token';

    vi.mocked(jwtService.verifyAsync).mockResolvedValue({
      sub: '',
      type: 'access',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token inválido ou expirado.'),
    );
  });

  it('deve rejeitar payload com sub que não seja string', async () => {
    request.headers.authorization = 'Bearer access-token';

    vi.mocked(jwtService.verifyAsync).mockResolvedValue({
      sub: 123,
      type: 'access',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token inválido ou expirado.'),
    );
  });

  it('deve rejeitar quando a verificação do JWT falhar', async () => {
    request.headers.authorization = 'Bearer invalid-token';

    vi.mocked(jwtService.verifyAsync).mockRejectedValue(
      new Error('Token expirado'),
    );

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token inválido ou expirado.'),
    );
  });
});
