
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CarrinhoGatewayPort } from '../../../application/ports/saida/carrinho-gateway.ports';
import { HttpClientService } from '../http/clients/http-client.service';
import { InternalApiHeadersService } from '../http/configuration/internal-api-headers.service';

@Injectable()
export class CarrinhoGatewayAdapter implements CarrinhoGatewayPort {
  private readonly serviceUrl: string;

  constructor(
    private readonly httpClient: HttpClientService,
    private readonly internalApiHeaders: InternalApiHeadersService,
    config: ConfigService,
  ) {
    this.serviceUrl = config.getOrThrow<string>('CARRINHO_SERVICE_URL');
  }

  async consultarCarrinho(userId: string) {
    return this.httpClient.request({
      method: 'GET',
      url: `${this.serviceUrl}/carrinho`,
      headers: this.internalApiHeaders.getHeaders({
        'x-user-id': userId,
      }),
    }, 'Não foi possível consultar o carrinho. O serviço está indisponível.');
  }

  async adicionarProdutoCarrinho(
    body: { produtoId: string; quantidade: number },
    userId: string,
  ) {
    return this.httpClient.request({
      method: 'POST',
      url: `${this.serviceUrl}/carrinho/itens`,
      data: body,
      headers: this.internalApiHeaders.getHeaders({
        'x-user-id': userId,
      }),
    }, 'Não foi possível adicionar o produto ao carrinho. O serviço está indisponível.');
  }

  async sincronizarCarrinho(
    body: { itens: { produtoId: string; quantidade: number }[] },
    userId: string,
  ) {
    return this.httpClient.request({
      method: 'POST',
      url: `${this.serviceUrl}/carrinho/sincronizar`,
      data: body,
      headers: this.internalApiHeaders.getHeaders({
        'x-user-id': userId,
      }),
    }, 'Não foi possível sincronizar o carrinho. O serviço está indisponível.');
  }

  async aumentarQuantidadeProduto(produtoId: string, userId: string) {
    return this.httpClient.request({
      method: 'PATCH',
      url: `${this.serviceUrl}/carrinho/itens/${encodeURIComponent(produtoId)}/aumentar`,
      data: {},
      headers: this.internalApiHeaders.getHeaders({
        'x-user-id': userId,
      }),
    }, 'Não foi possível aumentar a quantidade do produto. O serviço está indisponível.');
  }

  async diminuirQuantidadeProduto(produtoId: string, userId: string) {
    return this.httpClient.request({
      method: 'PATCH',
      url: `${this.serviceUrl}/carrinho/itens/${encodeURIComponent(produtoId)}/diminuir`,
      data: {},
      headers: this.internalApiHeaders.getHeaders({
        'x-user-id': userId,
      }),
    }, 'Não foi possível diminuir a quantidade do produto. O serviço está indisponível.');
  }

  async excluirProdutoCarrinho(produtoId: string, userId: string) {
    return this.httpClient.request({
      method: 'DELETE',
      url: `${this.serviceUrl}/carrinho/itens/${encodeURIComponent(produtoId)}`,
      headers: this.internalApiHeaders.getHeaders({
        'x-user-id': userId,
      }),
    }, 'Não foi possível excluir o produto do carrinho. O serviço está indisponível.');
  }

  async limparCarrinho(userId: string) {
    return this.httpClient.request({
      method: 'DELETE',
      url: `${this.serviceUrl}/carrinho`,
      headers: this.internalApiHeaders.getHeaders({
        'x-user-id': userId,
      }),
    }, 'Não foi possível limpar o carrinho. O serviço está indisponível.');
  }
}
