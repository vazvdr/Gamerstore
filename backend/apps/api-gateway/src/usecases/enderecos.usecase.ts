import { Injectable } from '@nestjs/common';
import { EnderecosGatewayPort } from '../application/ports/saida/enderecos-gateway.ports';

@Injectable()
export class EnderecosUseCase {
  constructor(
    private readonly enderecosGateway: EnderecosGatewayPort,
  ) {}

  async cadastrarEndereco(body: unknown, userId: string) {
    return this.enderecosGateway.cadastrarEndereco(body, userId);
  }
  async listarEnderecos(userId: string) {
    return this.enderecosGateway.listarEnderecos(userId);
  }
  async editarEndereco(id: string, body: unknown, userId: string) {
    return this.enderecosGateway.editarEndereco(id, body, userId);
  }
  async deletarEndereco(body: { id: string }, userId: string) {
    return this.enderecosGateway.deletarEndereco(body, userId);
  }
}
