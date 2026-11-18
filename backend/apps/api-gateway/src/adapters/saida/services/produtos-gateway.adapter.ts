import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProdutosGatewayPort } from '../../../application/ports/saida/produtos-gateway.ports';
import { HttpClientService } from '../http/clients/http-client.service';

@Injectable()
export class ProdutosGatewayAdapter implements ProdutosGatewayPort {
  private readonly serviceUrl: string;

  constructor(private readonly httpClient: HttpClientService, config: ConfigService) {
    this.serviceUrl = config.getOrThrow<string>('PRODUTOS_SERVICE_URL');
  }

  async listarProdutos() {
    return this.httpClient.request({
      method: 'GET',
      url: `${this.serviceUrl}/produtos`,
    }, 'Não foi possível listar os produtos. O serviço está indisponível.');
  }

  async listarProdutosPorId(id: string) {
    return this.httpClient.request({
      method: 'GET',
      url: `${this.serviceUrl}/produtos/${encodeURIComponent(id)}`,
    }, 'Não foi possível buscar o produto. O serviço está indisponível.');
  }
}
