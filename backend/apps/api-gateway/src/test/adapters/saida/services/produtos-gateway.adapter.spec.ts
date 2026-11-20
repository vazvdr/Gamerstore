
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProdutosGatewayAdapter } from '../../../../adapters/saida/services/produtos-gateway.adapter';
import { HttpClientService } from '../../../../adapters/saida/http/clients/http-client.service';

describe('ProdutosGatewayAdapter', () => {
  let adapter: ProdutosGatewayAdapter;
  let httpClient: HttpClientService;
  let config: ConfigService;

  const serviceUrl = 'http://localhost:3001';

  beforeEach(() => {
    httpClient = {
      request: vi.fn().mockResolvedValue({ sucesso: true }),
    } as unknown as HttpClientService;

    config = {
      getOrThrow: vi.fn().mockReturnValue(serviceUrl),
    } as unknown as ConfigService;

    adapter = new ProdutosGatewayAdapter(httpClient, config);
  });

  it('deve configurar a URL do serviço de produtos', () => {
    expect(config.getOrThrow).toHaveBeenCalledWith('PRODUTOS_SERVICE_URL');
  });

  it('deve listar os produtos', async () => {
    await adapter.listarProdutos();

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'GET',
        url: `${serviceUrl}/produtos`,
      },
      'Não foi possível listar os produtos. O serviço está indisponível.',
    );
  });

  it('deve buscar um produto pelo ID', async () => {
    await adapter.listarProdutosPorId('produto-123');

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'GET',
        url: `${serviceUrl}/produtos/produto-123`,
      },
      'Não foi possível buscar o produto. O serviço está indisponível.',
    );
  });

  it('deve codificar o ID do produto na URL', async () => {
    await adapter.listarProdutosPorId('produto 123');

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'GET',
        url: `${serviceUrl}/produtos/produto%20123`,
      },
      'Não foi possível buscar o produto. O serviço está indisponível.',
    );
  });

  it('deve retornar a resposta do HttpClientService ao listar produtos', async () => {
    const response = [{ id: '1', nome: 'Notebook Gamer' }];
    vi.mocked(httpClient.request).mockResolvedValue(response);

    await expect(adapter.listarProdutos()).resolves.toEqual(response);
  });

  it('deve retornar a resposta do HttpClientService ao buscar um produto', async () => {
    const response = { id: '1', nome: 'Notebook Gamer' };
    vi.mocked(httpClient.request).mockResolvedValue(response);

    await expect(adapter.listarProdutosPorId('1')).resolves.toEqual(response);
  });

  it('deve propagar erros do HttpClientService', async () => {
    const error = new Error('Falha na comunicação');
    vi.mocked(httpClient.request).mockRejectedValue(error);

    await expect(adapter.listarProdutos()).rejects.toBe(error);
  });
});
