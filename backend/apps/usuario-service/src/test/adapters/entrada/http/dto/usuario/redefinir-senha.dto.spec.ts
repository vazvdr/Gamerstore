
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { RedefinirSenhaDto } from '../../../../../../adapters/entrada/http/dto/usuario/redefinir-senha.dto';

describe('RedefinirSenhaDto', () => {
  const dadosValidos = {
    token: 'a'.repeat(64),
    senha: 'senha123',
  };

  it('deve aceitar dados válidos', async () => {
    const dto = plainToInstance(RedefinirSenhaDto, dadosValidos);

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve aceitar token hexadecimal em letras maiúsculas', async () => {
    const dto = plainToInstance(RedefinirSenhaDto, {
      ...dadosValidos,
      token: 'A'.repeat(64),
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar token que não seja string', async () => {
    const dto = plainToInstance(RedefinirSenhaDto, {
      ...dadosValidos,
      token: 123,
    });

    const erros = await validate(dto);

    expect(erros.find((e) => e.property === 'token')?.constraints)
      .toHaveProperty('isString', 'Token inválido.');
  });

  it('deve rejeitar token com formato inválido', async () => {
    const dto = plainToInstance(RedefinirSenhaDto, {
      ...dadosValidos,
      token: 'token-invalido',
    });

    const erros = await validate(dto);

    expect(erros.find((e) => e.property === 'token')?.constraints)
      .toHaveProperty('matches', 'Token de recuperação inválido.');
  });

  it('deve rejeitar token com menos de 64 caracteres', async () => {
    const dto = plainToInstance(RedefinirSenhaDto, {
      ...dadosValidos,
      token: 'a'.repeat(63),
    });

    expect((await validate(dto)).some((e) => e.property === 'token')).toBe(true);
  });

  it('deve rejeitar token com mais de 64 caracteres', async () => {
    const dto = plainToInstance(RedefinirSenhaDto, {
      ...dadosValidos,
      token: 'a'.repeat(65),
    });

    expect((await validate(dto)).some((e) => e.property === 'token')).toBe(true);
  });

  it('deve rejeitar senha que não seja string', async () => {
    const dto = plainToInstance(RedefinirSenhaDto, {
      ...dadosValidos,
      senha: 12345678,
    });

    const erros = await validate(dto);

    expect(erros.find((e) => e.property === 'senha')?.constraints)
      .toHaveProperty('isString', 'Informe uma senha válida.');
  });

  it('deve rejeitar senha com menos de 8 caracteres', async () => {
    const dto = plainToInstance(RedefinirSenhaDto, {
      ...dadosValidos,
      senha: '1234567',
    });

    const erros = await validate(dto);

    expect(erros.find((e) => e.property === 'senha')?.constraints)
      .toHaveProperty('minLength', 'A senha deve possuir pelo menos 8 caracteres.');
  });

  it('deve rejeitar propriedades obrigatórias ausentes', async () => {
    const dto = plainToInstance(RedefinirSenhaDto, {});

    const erros = await validate(dto);

    expect(erros.some((e) => e.property === 'token')).toBe(true);
    expect(erros.some((e) => e.property === 'senha')).toBe(true);
  });
});
