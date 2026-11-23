
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FreteGatewayAdapter } from '../../../../../src/adapters/saida/services/frete-gateway.adapter';
import { HttpClientService } from '../../../../../src/adapters/saida/http/clients/http-client.service';

describe('FreteGatewayAdapter', () => {
  let adapter: FreteGatewayAdapter;
  let httpClient: HttpClientService;
  let config: ConfigService;

  beforeEach(() => {
    httpClient = {
      request: vi.fn().mockResolvedValue({
        cepDestino: '23087420',
        estadoDestino: 'RJ',
        valorFrete: 15,
        moeda: 'BRL',
      }),
    } as unknown as HttpClientService;

    config = {
      getOrThrow: vi.fn().mockReturnValue('http://localhost:3006'),
    } as unknown as ConfigService;

    adapter = new FreteGatewayAdapter(httpClient, config);
  });

  it('deve consultar a URL do frete-service na configuração', () => {
    expect(config.getOrThrow).toHaveBeenCalledWith('FRETE_SERVICE_URL');
  });

  it('deve enviar uma requisição POST para calcular o frete', async () => {
    await adapter.calcularFrete('23087-420');

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'POST',
        url: 'http://localhost:3006/fretes/calcular',
        data: { cepDestino: '23087-420' },
      },
      'Não foi possível calcular o frete. O serviço está indisponível.',
    );
  });

  it('deve retornar o resultado recebido do frete-service', async () => {
    const resultado = await adapter.calcularFrete('23087-420');

    expect(resultado).toEqual({
      cepDestino: '23087420',
      estadoDestino: 'RJ',
      valorFrete: 15,
      moeda: 'BRL',
    });
  });

  it('deve propagar erros do HttpClientService', async () => {
    const erro = new Error('Serviço indisponível');
    vi.mocked(httpClient.request).mockRejectedValue(erro);

    await expect(adapter.calcularFrete('23087-420')).rejects.toThrow(erro);
  });
});