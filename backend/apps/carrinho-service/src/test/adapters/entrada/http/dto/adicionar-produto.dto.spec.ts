import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AdicionarProdutoDto } from '../../../../../adapters/entrada/http/dto/adicionar-produto.dto';

describe('AdicionarProdutoDto', () => {
  it('deve aceitar dados válidos', async () => {
    const dto = plainToInstance(AdicionarProdutoDto, {
      produtoId: '123',
      quantidade: 2,
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar produtoId que não seja string', async () => {
    const dto = plainToInstance(AdicionarProdutoDto, {
      produtoId: 123,
      quantidade: 2,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'produtoId')).toBe(true);
  });

  it('deve rejeitar produtoId vazio', async () => {
    const dto = plainToInstance(AdicionarProdutoDto, {
      produtoId: '',
      quantidade: 2,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'produtoId')).toBe(true);
  });

  it('deve rejeitar quantidade que não seja inteira', async () => {
    const dto = plainToInstance(AdicionarProdutoDto, {
      produtoId: '123',
      quantidade: 1.5,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'quantidade')).toBe(true);
  });

  it('deve rejeitar quantidade menor que 1', async () => {
    const dto = plainToInstance(AdicionarProdutoDto, {
      produtoId: '123',
      quantidade: 0,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'quantidade')).toBe(true);
  });

  it('deve rejeitar quantidade negativa', async () => {
    const dto = plainToInstance(AdicionarProdutoDto, {
      produtoId: '123',
      quantidade: -1,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'quantidade')).toBe(true);
  });
});
