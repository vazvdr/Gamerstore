import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FreteGatewayPort } from '../../../application/ports/saida/frete-gateway.ports';
import { HttpClientService } from '../http/clients/http-client.service';

@Injectable()
export class FreteGatewayAdapter implements FreteGatewayPort {
  private readonly serviceUrl: string;

  constructor(private readonly httpClient: HttpClientService, config: ConfigService) {
    this.serviceUrl = config.getOrThrow<string>('FRETE_SERVICE_URL');
  }

  async calcularFrete(cepDestino: string) {
    return this.httpClient.request({
      method: 'POST',
      url: `${this.serviceUrl}/fretes/calcular`,
      data: { cepDestino },
    }, 'Não foi possível calcular o frete. O serviço está indisponível.');
  }
}
