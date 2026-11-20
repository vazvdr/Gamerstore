import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CarrinhoGatewayAdapter } from '../../../../adapters/saida/services/carrinho-gateway.adapter';
import { HttpClientService } from '../../../../adapters/saida/http/clients/http-client.service';

describe('CarrinhoGatewayAdapter', () => {
  let adapter: CarrinhoGatewayAdapter;
  let httpClient: HttpClientService;
  let config: ConfigService;

  const serviceUrl = 'http://localhost:3003';
  const userId = 'user-123';

  beforeEach(() => {
    httpClient = {
      request: vi.fn().mockResolvedValue({ sucesso: true }),
    } as unknown as HttpClientService;

    config = {
      getOrThrow: vi.fn().mockReturnValue(serviceUrl),
    } as unknown as ConfigService;

    adapter = new CarrinhoGatewayAdapter(httpClient, config);
  });

  it('deve configurar a URL do serviço de carrinho', () => {
    expect(config.getOrThrow).toHaveBeenCalledWith('CARRINHO_SERVICE_URL');
  });

  it('deve consultar o carrinho', async () => {
    await adapter.consultarCarrinho(userId);

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'GET',
        url: `${serviceUrl}/carrinho`,
        headers: { 'x-user-id': userId },
      },
      'Não foi possível consultar o carrinho. O serviço está indisponível.',
    );
  });

  it('deve adicionar um produto ao carrinho', async () => {
    const body = { produtoId: 'produto-1', quantidade: 2 };

    await adapter.adicionarProdutoCarrinho(body, userId);

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'POST',
        url: `${serviceUrl}/carrinho/itens`,
        data: body,
        headers: { 'x-user-id': userId },
      },
      'Não foi possível adicionar o produto ao carrinho. O serviço está indisponível.',
    );
  });

  it('deve sincronizar o carrinho', async () => {
    const body = {
      itens: [
        { produtoId: 'produto-1', quantidade: 2 },
        { produtoId: 'produto-2', quantidade: 1 },
      ],
    };

    await adapter.sincronizarCarrinho(body, userId);

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'POST',
        url: `${serviceUrl}/carrinho/sincronizar`,
        data: body,
        headers: { 'x-user-id': userId },
      },
      'Não foi possível sincronizar o carrinho. O serviço está indisponível.',
    );
  });

  it('deve aumentar a quantidade de um produto', async () => {
    await adapter.aumentarQuantidadeProduto('produto 1', userId);

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'PATCH',
        url: `${serviceUrl}/carrinho/itens/produto%201/aumentar`,
        data: {},
        headers: { 'x-user-id': userId },
      },
      'Não foi possível aumentar a quantidade do produto. O serviço está indisponível.',
    );
  });

  it('deve diminuir a quantidade de um produto', async () => {
    await adapter.diminuirQuantidadeProduto('produto 1', userId);

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'PATCH',
        url: `${serviceUrl}/carrinho/itens/produto%201/diminuir`,
        data: {},
        headers: { 'x-user-id': userId },
      },
      'Não foi possível diminuir a quantidade do produto. O serviço está indisponível.',
    );
  });

  it('deve excluir um produto do carrinho', async () => {
    await adapter.excluirProdutoCarrinho('produto 1', userId);

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'DELETE',
        url: `${serviceUrl}/carrinho/itens/produto%201`,
        headers: { 'x-user-id': userId },
      },
      'Não foi possível excluir o produto do carrinho. O serviço está indisponível.',
    );
  });

  it('deve limpar o carrinho', async () => {
    await adapter.limparCarrinho(userId);

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'DELETE',
        url: `${serviceUrl}/carrinho`,
        headers: { 'x-user-id': userId },
      },
      'Não foi possível limpar o carrinho. O serviço está indisponível.',
    );
  });

  it('deve retornar a resposta do HttpClientService', async () => {
    const response = { itens: [], total: 0 };
    vi.mocked(httpClient.request).mockResolvedValue(response);

    await expect(adapter.consultarCarrinho(userId)).resolves.toEqual(response);
  });

  it('deve propagar erros do HttpClientService', async () => {
    const error = new Error('Falha na comunicação');
    vi.mocked(httpClient.request).mockRejectedValue(error);

    await expect(adapter.consultarCarrinho(userId)).rejects.toBe(error);
  });

  it('deve propagar erro quando a URL do serviço não estiver configurada', () => {
    const error = new Error('Configuration key "CARRINHO_SERVICE_URL" does not exist');

    vi.mocked(config.getOrThrow).mockImplementation(() => {
      throw error;
    });

    expect(() => new CarrinhoGatewayAdapter(httpClient, config)).toThrow(error);
  });
});
