
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FreteGatewayPort } from '../../application/ports/saida/frete-gateway.ports';
import { FreteUseCase } from '../../usecases/frete.usecase';

describe('FreteUseCase', () => {
  let useCase: FreteUseCase;
  let freteGateway: FreteGatewayPort;

  beforeEach(() => {
    freteGateway = {
      calcularFrete: vi.fn().mockResolvedValue({
        cepDestino: '20000000',
        estadoDestino: 'RJ',
        valorFrete: 15,
        moeda: 'BRL',
      }),
    };

    useCase = new FreteUseCase(freteGateway);
  });

  it('deve encaminhar o CEP ao gateway', async () => {
    await useCase.calcularFrete('20000-000');

    expect(freteGateway.calcularFrete).toHaveBeenCalledOnce();
    expect(freteGateway.calcularFrete).toHaveBeenCalledWith('20000-000');
  });

  it('deve retornar o resultado recebido do gateway', async () => {
    const resultado = await useCase.calcularFrete('20000-000');

    expect(resultado).toEqual({
      cepDestino: '20000000',
      estadoDestino: 'RJ',
      valorFrete: 15,
      moeda: 'BRL',
    });
  });

  it('deve propagar erros lançados pelo gateway', async () => {
    const erro = new Error('Serviço de frete indisponível');
    vi.mocked(freteGateway.calcularFrete).mockRejectedValue(erro);

    await expect(useCase.calcularFrete('20000-000')).rejects.toThrow(erro);
  });
});
