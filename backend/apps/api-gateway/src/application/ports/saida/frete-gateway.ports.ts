export abstract class FreteGatewayPort {
  abstract calcularFrete(cepDestino: string): Promise<unknown>;
}
