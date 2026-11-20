
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { LogarUsuarioDto } from '../../../../../../adapters/entrada/http/dto/usuario/logar-usuario.dto';

describe('LogarUsuarioDto', () => {
  const dadosValidos = {
    email: 'joazinho@email.com',
    senha: 'senha123',
  };

  it('deve aceitar dados válidos', async () => {
    const dto = plainToInstance(LogarUsuarioDto, dadosValidos);

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar e-mail inválido', async () => {
    const dto = plainToInstance(LogarUsuarioDto, {
      ...dadosValidos,
      email: 'email-invalido',
    });

    expect((await validate(dto)).some((e) => e.property === 'email')).toBe(true);
  });

  it('deve rejeitar senha que não seja string', async () => {
    const dto = plainToInstance(LogarUsuarioDto, {
      ...dadosValidos,
      senha: 12345678,
    });

    expect((await validate(dto)).some((e) => e.property === 'senha')).toBe(true);
  });

  it('deve rejeitar senha com menos de 8 caracteres', async () => {
    const dto = plainToInstance(LogarUsuarioDto, {
      ...dadosValidos,
      senha: '1234567',
    });

    expect((await validate(dto)).some((e) => e.property === 'senha')).toBe(true);
  });

  it('deve rejeitar propriedades obrigatórias ausentes', async () => {
    const dto = plainToInstance(LogarUsuarioDto, {});

    const erros = await validate(dto);

    expect(erros.some((e) => e.property === 'email')).toBe(true);
    expect(erros.some((e) => e.property === 'senha')).toBe(true);
  });
});
