
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CadastrarEnderecoDto } from '../../../../../../adapters/entrada/http/dto/endereco/cadastrar-endereco.dto';

describe('CadastrarEnderecoDto', () => {
  const dadosValidos = {
    bairro: 'Centro',
    cep: '12345-678',
    cidade: 'Rio de Janeiro',
    complemento: 'Apartamento 101',
    estado: 'RJ',
    numero: '123',
    rua: 'Rua das Flores',
    principal: true,
  };

  it('deve aceitar todos os dados válidos', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, dadosValidos);

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve aceitar CEP sem hífen', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      cep: '12345678',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar bairro que não seja string', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      bairro: 123,
    });

    expect((await validate(dto)).some((e) => e.property === 'bairro')).toBe(true);
  });

  it('deve rejeitar bairro com menos de 2 caracteres', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      bairro: 'A',
    });

    expect((await validate(dto)).some((e) => e.property === 'bairro')).toBe(true);
  });

  it('deve rejeitar bairro com mais de 150 caracteres', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      bairro: 'A'.repeat(151),
    });

    expect((await validate(dto)).some((e) => e.property === 'bairro')).toBe(true);
  });

  it('deve rejeitar CEP que não seja string', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      cep: 12345678,
    });

    expect((await validate(dto)).some((e) => e.property === 'cep')).toBe(true);
  });

  it('deve rejeitar CEP com formato inválido', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      cep: '1234-567',
    });

    expect((await validate(dto)).some((e) => e.property === 'cep')).toBe(true);
  });

  it('deve rejeitar cidade que não seja string', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      cidade: 123,
    });

    expect((await validate(dto)).some((e) => e.property === 'cidade')).toBe(true);
  });

  it('deve rejeitar cidade com menos de 2 caracteres', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      cidade: 'A',
    });

    expect((await validate(dto)).some((e) => e.property === 'cidade')).toBe(true);
  });

  it('deve rejeitar cidade com mais de 150 caracteres', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      cidade: 'A'.repeat(151),
    });

    expect((await validate(dto)).some((e) => e.property === 'cidade')).toBe(true);
  });

  it('deve aceitar complemento ausente', async () => {
    const { complemento, ...dados } = dadosValidos;
    const dto = plainToInstance(CadastrarEnderecoDto, dados);

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve aceitar complemento vazio', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      complemento: '',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar complemento que não seja string', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      complemento: 123,
    });

    expect((await validate(dto)).some((e) => e.property === 'complemento')).toBe(true);
  });

  it('deve rejeitar complemento com mais de 150 caracteres', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      complemento: 'A'.repeat(151),
    });

    expect((await validate(dto)).some((e) => e.property === 'complemento')).toBe(true);
  });

  it('deve rejeitar estado que não seja string', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      estado: 12,
    });

    expect((await validate(dto)).some((e) => e.property === 'estado')).toBe(true);
  });

  it('deve rejeitar estado com formato inválido', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      estado: 'Rio',
    });

    expect((await validate(dto)).some((e) => e.property === 'estado')).toBe(true);
  });

  it('deve rejeitar estado com números', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      estado: 'R1',
    });

    expect((await validate(dto)).some((e) => e.property === 'estado')).toBe(true);
  });

  it('deve aceitar estado em letras minúsculas', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      estado: 'rj',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar número que não seja string', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      numero: 123,
    });

    expect((await validate(dto)).some((e) => e.property === 'numero')).toBe(true);
  });

  it('deve rejeitar número com mais de 20 caracteres', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      numero: '1'.repeat(21),
    });

    expect((await validate(dto)).some((e) => e.property === 'numero')).toBe(true);
  });

  it('deve aceitar número vazio', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      numero: '',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar rua que não seja string', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      rua: 123,
    });

    expect((await validate(dto)).some((e) => e.property === 'rua')).toBe(true);
  });

  it('deve rejeitar rua com menos de 2 caracteres', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      rua: 'A',
    });

    expect((await validate(dto)).some((e) => e.property === 'rua')).toBe(true);
  });

  it('deve rejeitar rua com mais de 255 caracteres', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      rua: 'A'.repeat(256),
    });

    expect((await validate(dto)).some((e) => e.property === 'rua')).toBe(true);
  });

  it('deve aceitar principal ausente', async () => {
    const { principal, ...dados } = dadosValidos;
    const dto = plainToInstance(CadastrarEnderecoDto, dados);

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar principal que não seja boolean', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {
      ...dadosValidos,
      principal: 'true',
    });

    expect((await validate(dto)).some((e) => e.property === 'principal')).toBe(true);
  });

  it('deve rejeitar propriedades obrigatórias ausentes', async () => {
    const dto = plainToInstance(CadastrarEnderecoDto, {});

    const erros = await validate(dto);
    const propriedades = [
      'bairro',
      'cep',
      'cidade',
      'estado',
      'numero',
      'rua',
    ];

    for (const propriedade of propriedades) {
      expect(erros.some((e) => e.property === propriedade)).toBe(true);
    }
  });
});
