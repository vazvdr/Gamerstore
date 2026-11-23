
import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TabelaFretePort } from '../../../application/ports/saida/tabela-frete.port';
import { CalcularFreteUseCase } from '../../../application/usecases/calcular-frete.usecase';

describe('CalcularFreteUseCase', () => {
  let useCase: CalcularFreteUseCase;
  let tabelaFrete: TabelaFretePort;

  beforeEach(() => {
    tabelaFrete = {
      consultarValor: vi.fn().mockReturnValue(15),
    };

    useCase = new CalcularFreteUseCase(tabelaFrete);
  });

  it('deve calcular o frete para um CEP do RJ', () => {
    const resultado = useCase.executar('20000-000');

    expect(resultado).toEqual({
      cepDestino: '2000000',
      estadoDestino: 'RJ',
      valorFrete: 15,
      moeda: 'BRL',
    });
    expect(tabelaFrete.consultarValor).toHaveBeenCalledOnce();
    expect(tabelaFrete.consultarValor).toHaveBeenCalledWith('RJ');
  });

  it('deve calcular o frete para um CEP sem hífen', () => {
    const resultado = useCase.executar('20000000');

    expect(resultado.cepDestino).toBe('20000000');
    expect(resultado.estadoDestino).toBe('RJ');
    expect(resultado.valorFrete).toBe(15);
  });

  it('deve remover caracteres não numéricos do CEP retornado', () => {
    const resultado = useCase.executar('20000-000');

    expect(resultado.cepDestino).toBe('20000000');
  });

  it('deve consultar o valor correspondente ao estado identificado', () => {
    vi.mocked(tabelaFrete.consultarValor).mockReturnValue(20);

    const resultado = useCase.executar('01000-000');

    expect(resultado.estadoDestino).toBe('SP');
    expect(resultado.valorFrete).toBe(20);
    expect(tabelaFrete.consultarValor).toHaveBeenCalledWith('SP');
  });

  it.each(['', '1234', '1234567', '123456789', 'ABCDE-123', '00000-000'])(
    'deve lançar BadRequestException para o CEP inválido %s',
    (cep) => {
      expect(() => useCase.executar(cep)).toThrow(BadRequestException);
      expect(tabelaFrete.consultarValor).not.toHaveBeenCalled();
    },
  );

  it('deve propagar erros da tabela de frete', () => {
    const erro = new Error('Falha ao consultar tabela');
    vi.mocked(tabelaFrete.consultarValor).mockImplementation(() => {
      throw erro;
    });

    expect(() => useCase.executar('20000-000')).toThrow(erro);
  });
});
