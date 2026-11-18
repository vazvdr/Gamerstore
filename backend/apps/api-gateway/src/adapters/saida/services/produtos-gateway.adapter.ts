
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProdutosGatewayPort } from '../../../application/ports/saida/produtos-gateway.ports';
import { HttpClientService } from '../http/clients/http-client.service';
import { InternalApiHeadersService } from '../http/configuration/internal-api-headers.service';

@Injectable()
export class ProdutosGatewayAdapter implements ProdutosGatewayPort {
  private readonly serviceUrl: string;

  constructor(
    private readonly httpClient: HttpClientService,
    private readonly internalApiHeaders: InternalApiHeadersService,
    config: ConfigService,
  ) {
    this.serviceUrl = config.getOrThrow<string>('PRODUTOS_SERVICE_URL');
  }

  async listarProdutos() {
    return this.httpClient.request({
      method: 'GET',
      url: `${this.serviceUrl}/produtos`,
      headers: this.internalApiHeaders.getHeaders(),
    }, 'Não foi possível listar os produtos. O serviço está indisponível.');
  }

  async listarProdutosPorId(id: string) {
    return this.httpClient.request({
      method: 'GET',
      url: `${this.serviceUrl}/produtos/${encodeURIComponent(id)}`,
      headers: this.internalApiHeaders.getHeaders(),
    }, 'Não foi possível buscar o produto. O serviço está indisponível.');
  }
}
