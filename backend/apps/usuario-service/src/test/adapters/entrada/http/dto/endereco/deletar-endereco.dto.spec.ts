import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { DeletarEnderecoDto } from '../../../../../../adapters/entrada/http/dto/endereco/deletar-endereco.dto';

describe('DeletarEnderecoDto', () => {
  it('deve aceitar UUID válido', async () => {
    const dto = plainToInstance(DeletarEnderecoDto, {
      id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar identificador que não seja UUID', async () => {
    const dto = plainToInstance(DeletarEnderecoDto, {
      id: 'id-invalido',
    });
    expect((await validate(dto)).some((e) => e.property === 'id')).toBe(true);
  });

  it('deve rejeitar identificador que não seja string', async () => {
    const dto = plainToInstance(DeletarEnderecoDto, {
      id: 123,
    });
    expect((await validate(dto)).some((e) => e.property === 'id')).toBe(true);
  });

  it('deve rejeitar identificador ausente', async () => {
    const dto = plainToInstance(DeletarEnderecoDto, {});
    expect((await validate(dto)).some((e) => e.property === 'id')).toBe(true);
  });

  it('deve rejeitar identificador vazio', async () => {
    const dto = plainToInstance(DeletarEnderecoDto, {
      id: '',
    });
    expect((await validate(dto)).some((e) => e.property === 'id')).toBe(true);
  });
});
