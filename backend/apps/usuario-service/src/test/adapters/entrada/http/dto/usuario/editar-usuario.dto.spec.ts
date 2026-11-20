
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { EditarUsuarioDto } from '../../../../../../adapters/entrada/http/dto/usuario/editar-usuario.dto';

describe('EditarUsuarioDto', () => {
  const dadosValidos = {
    senhaAtual: 'senha123',
    nome: 'Joazinho',
    email: 'joazinho@email.com',
    novaSenha: 'senha456',
  };

  it('deve aceitar todos os dados válidos', async () => {
    const dto = plainToInstance(EditarUsuarioDto, dadosValidos);

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve aceitar somente a senha atual', async () => {
    const dto = plainToInstance(EditarUsuarioDto, {
      senhaAtual: 'senha123',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve aceitar propriedades opcionais ausentes', async () => {
    const dto = plainToInstance(EditarUsuarioDto, {
      senhaAtual: 'senha123',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar senha atual que não seja string', async () => {
    const dto = plainToInstance(EditarUsuarioDto, {
      ...dadosValidos,
      senhaAtual: 12345678,
    });

    expect((await validate(dto)).some((e) => e.property === 'senhaAtual')).toBe(true);
  });

  it('deve rejeitar senha atual com menos de 8 caracteres', async () => {
    const dto = plainToInstance(EditarUsuarioDto, {
      ...dadosValidos,
      senhaAtual: '1234567',
    });

    expect((await validate(dto)).some((e) => e.property === 'senhaAtual')).toBe(true);
  });

  it('deve rejeitar senha atual com mais de 128 caracteres', async () => {
    const dto = plainToInstance(EditarUsuarioDto, {
      ...dadosValidos,
      senhaAtual: 'A'.repeat(129),
    });

    expect((await validate(dto)).some((e) => e.property === 'senhaAtual')).toBe(true);
  });

  it('deve rejeitar nome que não seja string', async () => {
    const dto = plainToInstance(EditarUsuarioDto, {
      senhaAtual: 'senha123',
      nome: 123,
    });

    expect((await validate(dto)).some((e) => e.property === 'nome')).toBe(true);
  });

  it('deve rejeitar nome com menos de 2 caracteres', async () => {
    const dto = plainToInstance(EditarUsuarioDto, {
      senhaAtual: 'senha123',
      nome: 'A',
    });

    expect((await validate(dto)).some((e) => e.property === 'nome')).toBe(true);
  });

  it('deve rejeitar nome com mais de 150 caracteres', async () => {
    const dto = plainToInstance(EditarUsuarioDto, {
      senhaAtual: 'senha123',
      nome: 'A'.repeat(151),
    });

    expect((await validate(dto)).some((e) => e.property === 'nome')).toBe(true);
  });

  it('deve rejeitar e-mail inválido', async () => {
    const dto = plainToInstance(EditarUsuarioDto, {
      senhaAtual: 'senha123',
      email: 'email-invalido',
    });

    expect((await validate(dto)).some((e) => e.property === 'email')).toBe(true);
  });

  it('deve rejeitar e-mail com mais de 255 caracteres', async () => {
    const dto = plainToInstance(EditarUsuarioDto, {
      senhaAtual: 'senha123',
      email: `${'a'.repeat(244)}@email.com`,
    });

    expect((await validate(dto)).some((e) => e.property === 'email')).toBe(true);
  });

  it('deve rejeitar nova senha que não seja string', async () => {
    const dto = plainToInstance(EditarUsuarioDto, {
      senhaAtual: 'senha123',
      novaSenha: 12345678,
    });

    expect((await validate(dto)).some((e) => e.property === 'novaSenha')).toBe(true);
  });

  it('deve rejeitar nova senha com menos de 8 caracteres', async () => {
    const dto = plainToInstance(EditarUsuarioDto, {
      senhaAtual: 'senha123',
      novaSenha: '1234567',
    });

    expect((await validate(dto)).some((e) => e.property === 'novaSenha')).toBe(true);
  });

  it('deve rejeitar nova senha com mais de 128 caracteres', async () => {
    const dto = plainToInstance(EditarUsuarioDto, {
      senhaAtual: 'senha123',
      novaSenha: 'A'.repeat(129),
    });

    expect((await validate(dto)).some((e) => e.property === 'novaSenha')).toBe(true);
  });

  it('deve rejeitar senha atual ausente', async () => {
    const dto = plainToInstance(EditarUsuarioDto, {
      nome: 'Joazinho',
    });

    expect((await validate(dto)).some((e) => e.property === 'senhaAtual')).toBe(true);
  });
});
