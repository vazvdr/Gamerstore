
import { describe, expect, it, beforeEach } from 'vitest';
import { TabelaFreteAdapter } from '../../../adapters/saida/tabela-frete.adapter';
import { VALORES_FRETE } from '../../../domain/entities/valores-frete';

describe('TabelaFreteAdapter', () => {
  let adapter: TabelaFreteAdapter;

  beforeEach(() => {
    adapter = new TabelaFreteAdapter();
  });

  it.each([
    ['RJ', 15],
    ['SP', 20],
    ['MG', 25],
    ['DF', 30],
    ['RS', 35],
    ['BA', 40],
    ['AC', 65],
    ['RR', 70],
  ] as const)('deve retornar o valor de frete para %s', (estado, valor) => {
    expect(adapter.consultarValor(estado)).toBe(valor);
  });

  it('deve retornar o valor cadastrado na tabela para todos os estados', () => {
    for (const [estado, valor] of Object.entries(VALORES_FRETE)) {
      expect(adapter.consultarValor(estado as keyof typeof VALORES_FRETE)).toBe(valor);
    }
  });
});
