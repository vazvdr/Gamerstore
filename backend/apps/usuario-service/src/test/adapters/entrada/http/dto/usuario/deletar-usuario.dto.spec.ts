
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { DeletarUsuarioDto } from '../../../../../../adapters/entrada/http/dto/usuario/deletar-usuario.dto';

describe('DeletarUsuarioDto', () => {
  it('deve aceitar senha atual válida', async () => {
    const dto = plainToInstance(DeletarUsuarioDto, {
      senhaAtual: 'senha123',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar senha que não seja string', async () => {
    const dto = plainToInstance(DeletarUsuarioDto, {
      senhaAtual: 12345678,
    });

    expect((await validate(dto)).some((e) => e.property === 'senhaAtual')).toBe(true);
  });

  it('deve rejeitar senha com menos de 8 caracteres', async () => {
    const dto = plainToInstance(DeletarUsuarioDto, {
      senhaAtual: '1234567',
    });

    expect((await validate(dto)).some((e) => e.property === 'senhaAtual')).toBe(true);
  });

  it('deve rejeitar senha com mais de 128 caracteres', async () => {
    const dto = plainToInstance(DeletarUsuarioDto, {
      senhaAtual: 'A'.repeat(129),
    });

    expect((await validate(dto)).some((e) => e.property === 'senhaAtual')).toBe(true);
  });

  it('deve rejeitar senha atual ausente', async () => {
    const dto = plainToInstance(DeletarUsuarioDto, {});

    expect((await validate(dto)).some((e) => e.property === 'senhaAtual')).toBe(true);
  });
});
