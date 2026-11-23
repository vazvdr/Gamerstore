import { Injectable } from '@nestjs/common';
import { FreteGatewayPort } from '../application/ports/saida/frete-gateway.ports';

@Injectable()
export class FreteUseCase {
  constructor(private readonly freteGateway: FreteGatewayPort) {}

  async calcularFrete(cepDestino: string) {
    return this.freteGateway.calcularFrete(cepDestino);
  }
}
