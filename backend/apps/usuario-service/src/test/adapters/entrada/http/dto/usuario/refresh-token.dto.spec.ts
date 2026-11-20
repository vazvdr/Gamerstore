
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { RefreshTokenDto } from '../../../../../../adapters/entrada/http/dto/usuario/refresh-token.dto';

describe('RefreshTokenDto', () => {
  const refreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature';

  it('deve aceitar JWT válido', async () => {
    const dto = plainToInstance(RefreshTokenDto, { refreshToken });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar token que não seja JWT', async () => {
    const dto = plainToInstance(RefreshTokenDto, {
      refreshToken: 'token-invalido',
    });

    expect((await validate(dto)).some((e) => e.property === 'refreshToken')).toBe(true);
  });

  it('deve rejeitar token vazio', async () => {
    const dto = plainToInstance(RefreshTokenDto, {
      refreshToken: '',
    });

    expect((await validate(dto)).some((e) => e.property === 'refreshToken')).toBe(true);
  });

  it('deve rejeitar token que não seja string', async () => {
    const dto = plainToInstance(RefreshTokenDto, {
      refreshToken: 123,
    });

    expect((await validate(dto)).some((e) => e.property === 'refreshToken')).toBe(true);
  });

  it('deve rejeitar refreshToken ausente', async () => {
    const dto = plainToInstance(RefreshTokenDto, {});

    expect((await validate(dto)).some((e) => e.property === 'refreshToken')).toBe(true);
  });
});
