
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CadastrarUsuarioDto } from '../../../../../../adapters/entrada/http/dto/usuario/cadastrar-usuario.dto';

describe('CadastrarUsuarioDto', () => {
  const dadosValidos = {
    nome: 'Joazinho',
    email: 'joazinho@email.com',
    senha: 'senha123',
  };

  it('deve aceitar dados válidos', async () => {
    const dto = plainToInstance(CadastrarUsuarioDto, dadosValidos);

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar nome que não seja string', async () => {
    const dto = plainToInstance(CadastrarUsuarioDto, {
      ...dadosValidos,
      nome: 123,
    });

    expect((await validate(dto)).some((e) => e.property === 'nome')).toBe(true);
  });

  it('deve rejeitar nome com menos de 2 caracteres', async () => {
    const dto = plainToInstance(CadastrarUsuarioDto, {
      ...dadosValidos,
      nome: 'A',
    });

    expect((await validate(dto)).some((e) => e.property === 'nome')).toBe(true);
  });

  it('deve rejeitar nome com mais de 150 caracteres', async () => {
    const dto = plainToInstance(CadastrarUsuarioDto, {
      ...dadosValidos,
      nome: 'A'.repeat(151),
    });

    expect((await validate(dto)).some((e) => e.property === 'nome')).toBe(true);
  });

  it('deve rejeitar e-mail inválido', async () => {
    const dto = plainToInstance(CadastrarUsuarioDto, {
      ...dadosValidos,
      email: 'email-invalido',
    });

    expect((await validate(dto)).some((e) => e.property === 'email')).toBe(true);
  });

  it('deve rejeitar e-mail com mais de 255 caracteres', async () => {
    const dto = plainToInstance(CadastrarUsuarioDto, {
      ...dadosValidos,
      email: `${'a'.repeat(244)}@email.com`,
    });

    expect((await validate(dto)).some((e) => e.property === 'email')).toBe(true);
  });

  it('deve rejeitar senha que não seja string', async () => {
    const dto = plainToInstance(CadastrarUsuarioDto, {
      ...dadosValidos,
      senha: 12345678,
    });

    expect((await validate(dto)).some((e) => e.property === 'senha')).toBe(true);
  });

  it('deve rejeitar senha com menos de 8 caracteres', async () => {
    const dto = plainToInstance(CadastrarUsuarioDto, {
      ...dadosValidos,
      senha: '1234567',
    });

    expect((await validate(dto)).some((e) => e.property === 'senha')).toBe(true);
  });

  it('deve rejeitar senha com mais de 128 caracteres', async () => {
    const dto = plainToInstance(CadastrarUsuarioDto, {
      ...dadosValidos,
      senha: 'A'.repeat(129),
    });

    expect((await validate(dto)).some((e) => e.property === 'senha')).toBe(true);
  });
});
