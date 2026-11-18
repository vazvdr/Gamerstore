import { Injectable } from '@nestjs/common';
import { ProdutosGatewayPort } from '../application/ports/saida/produtos-gateway.ports';

@Injectable()
export class ProdutosUseCase {
  constructor(
    private readonly produtosGateway: ProdutosGatewayPort,
  ) {}

  async listarProdutos() {
    return this.produtosGateway.listarProdutos();
  }
  async listarProdutosPorId(id: string) {
    return this.produtosGateway.listarProdutosPorId(id);
  }
}
