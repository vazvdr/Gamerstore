
import { describe, expect, it } from 'vitest';
import { EstadoBrasileiro, FAIXAS_CEP, identificarEstadoPorCep } from '../../../../src/domain/entities/estado-cep';

describe('identificarEstadoPorCep', () => {
  it.each([
    ['01000-000', 'SP'],
    ['20000-000', 'RJ'],
    ['23087-420', 'RJ'],
    ['29000-000', 'ES'],
    ['30000-000', 'MG'],
    ['40000-000', 'BA'],
    ['49000-000', 'SE'],
    ['50000-000', 'PE'],
    ['57000-000', 'AL'],
    ['58000-000', 'PB'],
    ['59000-000', 'RN'],
    ['60000-000', 'CE'],
    ['64000-000', 'PI'],
    ['65000-000', 'MA'],
    ['66000-000', 'PA'],
    ['68900-000', 'AP'],
    ['69000-000', 'AM'],
    ['69300-000', 'RR'],
    ['69900-000', 'AC'],
    ['70000-000', 'DF'],
    ['72800-000', 'GO'],
    ['73000-000', 'DF'],
    ['73700-000', 'GO'],
    ['76800-000', 'RO'],
    ['77000-000', 'TO'],
    ['78000-000', 'MT'],
    ['79000-000', 'MS'],
    ['80000-000', 'PR'],
    ['88000-000', 'SC'],
    ['90000-000', 'RS'],
  ] as [string, EstadoBrasileiro][])('deve identificar o estado do CEP %s como %s', (cep, estado) => {
    expect(identificarEstadoPorCep(cep)).toBe(estado);
  });

  it('deve aceitar CEP sem hífen', () => {
    expect(identificarEstadoPorCep('23087420')).toBe('RJ');
  });

  it('deve aceitar espaços ao redor do CEP', () => {
    expect(identificarEstadoPorCep(' 23087-420 ')).toBe('RJ');
  });

  it.each(['', '1234', '1234567', '123456789', 'ABCDE-123', '2308A-420', '23087 420'])(
    'deve retornar null para o CEP inválido %s',
    (cep) => {
      expect(identificarEstadoPorCep(cep)).toBeNull();
    },
  );

  it('deve retornar null quando o CEP não pertence a nenhuma faixa', () => {
    expect(identificarEstadoPorCep('00000-000')).toBeNull();
  });
});

describe('FAIXAS_CEP', () => {
  it('deve possuir faixas cadastradas', () => {
    expect(FAIXAS_CEP.length).toBeGreaterThan(0);
  });
});
