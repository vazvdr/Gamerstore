
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnderecosGatewayPort } from '../../../application/ports/saida/enderecos-gateway.ports';
import { HttpClientService } from '../http/clients/http-client.service';
import { InternalApiHeadersService } from '../http/configuration/internal-api-headers.service';

@Injectable()
export class EnderecosGatewayAdapter implements EnderecosGatewayPort {
  private readonly serviceUrl: string;

  constructor(
    private readonly httpClient: HttpClientService,
    private readonly internalApiHeaders: InternalApiHeadersService,
    config: ConfigService,
  ) {
    this.serviceUrl = config.getOrThrow<string>('USUARIO_SERVICE_URL');
  }

  async cadastrarEndereco(body: unknown, userId: string) {
    return this.httpClient.request({
      method: 'POST',
      url: `${this.serviceUrl}/usuarios/enderecos`,
      data: body,
      headers: this.internalApiHeaders.getHeaders({
        'x-authenticated-user-id': userId,
      }),
    }, 'Não foi possível cadastrar o endereço.');
  }

  async listarEnderecos(userId: string) {
    return this.httpClient.request({
      method: 'GET',
      url: `${this.serviceUrl}/usuarios/enderecos`,
      headers: this.internalApiHeaders.getHeaders({
        'x-authenticated-user-id': userId,
      }),
    }, 'Não foi possível listar os endereços.');
  }

  async editarEndereco(id: string, body: unknown, userId: string) {
    return this.httpClient.request({
      method: 'PATCH',
      url: `${this.serviceUrl}/usuarios/enderecos/${encodeURIComponent(id)}`,
      data: body,
      headers: this.internalApiHeaders.getHeaders({
        'x-authenticated-user-id': userId,
      }),
    }, 'Não foi possível atualizar o endereço.');
  }

  async deletarEndereco(body: { id: string }, userId: string) {
    return this.httpClient.request({
      method: 'DELETE',
      url: `${this.serviceUrl}/usuarios/enderecos`,
      data: body,
      headers: this.internalApiHeaders.getHeaders({
        'x-authenticated-user-id': userId,
      }),
    }, 'Não foi possível excluir o endereço.');
  }
}
