
import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalcularFreteUseCase } from '../../../../../application/usecases/calcular-frete.usecase';
import { FreteController } from '../../../../../adapters/entrada/http/controllers/frete.controller';

describe('FreteController', () => {
  let controller: FreteController;
  let calcularFreteUseCase: CalcularFreteUseCase;

  beforeEach(() => {
    calcularFreteUseCase = {
      executar: vi.fn().mockReturnValue({
        cepDestino: '20000000',
        estadoDestino: 'RJ',
        valorFrete: 15,
        moeda: 'BRL',
      }),
    } as unknown as CalcularFreteUseCase;

    controller = new FreteController(calcularFreteUseCase);
  });

  it('deve calcular o frete utilizando o CEP informado', () => {
    const resultado = controller.calcular({ cepDestino: '20000-000' });

    expect(resultado).toEqual({
      cepDestino: '2000000',
      estadoDestino: 'RJ',
      valorFrete: 15,
      moeda: 'BRL',
    });
    expect(calcularFreteUseCase.executar).toHaveBeenCalledOnce();
    expect(calcularFreteUseCase.executar).toHaveBeenCalledWith('20000-000');
  });

  it('deve encaminhar o CEP sem hífen ao use case', () => {
    controller.calcular({ cepDestino: '20000000' });

    expect(calcularFreteUseCase.executar).toHaveBeenCalledWith('2000000');
  });

  it('deve propagar erros lançados pelo use case', () => {
    vi.mocked(calcularFreteUseCase.executar).mockImplementation(() => {
      throw new BadRequestException('CEP de destino inválido ou não reconhecido.');
    });

    expect(() => controller.calcular({ cepDestino: '00000-000' })).toThrow(BadRequestException);
  });
});
