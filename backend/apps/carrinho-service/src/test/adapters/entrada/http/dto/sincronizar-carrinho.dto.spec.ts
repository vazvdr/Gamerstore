
import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  ItemSincronizacaoDto,
  SincronizarCarrinhoDto,
} from '../../../../../adapters/entrada/http/dto/sincronizar-carrinho.dto';

describe('ItemSincronizacaoDto', () => {
  it('deve aceitar dados válidos', async () => {
    const dto = plainToInstance(ItemSincronizacaoDto, {
      produtoId: '123',
      quantidade: 2,
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar produtoId que não seja string', async () => {
    const dto = plainToInstance(ItemSincronizacaoDto, {
      produtoId: 123,
      quantidade: 2,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'produtoId')).toBe(true);
  });

  it('deve rejeitar produtoId vazio', async () => {
    const dto = plainToInstance(ItemSincronizacaoDto, {
      produtoId: '',
      quantidade: 2,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'produtoId')).toBe(true);
  });

  it('deve rejeitar quantidade que não seja inteira', async () => {
    const dto = plainToInstance(ItemSincronizacaoDto, {
      produtoId: '123',
      quantidade: 1.5,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'quantidade')).toBe(true);
  });

  it('deve rejeitar quantidade menor que 1', async () => {
    const dto = plainToInstance(ItemSincronizacaoDto, {
      produtoId: '123',
      quantidade: 0,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'quantidade')).toBe(true);
  });
});

describe('SincronizarCarrinhoDto', () => {
  it('deve aceitar uma lista de itens válidos', async () => {
    const dto = plainToInstance(SincronizarCarrinhoDto, {
      itens: [
        { produtoId: '123', quantidade: 2 },
        { produtoId: '456', quantidade: 1 },
      ],
    });

    expect(await validate(dto)).toHaveLength(0);
    expect(dto.itens[0]).toBeInstanceOf(ItemSincronizacaoDto);
  });

  it('deve aceitar uma lista vazia', async () => {
    const dto = plainToInstance(SincronizarCarrinhoDto, {
      itens: [],
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar itens que não sejam um array', async () => {
    const dto = plainToInstance(SincronizarCarrinhoDto, {
      itens: '123',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'itens')).toBe(true);
  });

  it('deve rejeitar itens ausentes', async () => {
    const dto = plainToInstance(SincronizarCarrinhoDto, {});

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'itens')).toBe(true);
  });

  it('deve rejeitar propriedades inválidas nos itens', async () => {
    const dto = plainToInstance(SincronizarCarrinhoDto, {
      itens: [{ produtoId: '', quantidade: 0 }],
    });

    const errors = await validate(dto);
    const itensError = errors.find((error) => error.property === 'itens');

    expect(itensError).toBeDefined();
    expect(itensError?.children).toHaveLength(1);
    expect(itensError?.children?.[0].children).toHaveLength(2);
  });

  it('deve rejeitar elementos que não sejam objetos válidos', async () => {
    const dto = plainToInstance(SincronizarCarrinhoDto, {
      itens: [123],
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'itens')).toBe(true);
  });
});
