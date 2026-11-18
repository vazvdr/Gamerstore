import { Injectable } from '@nestjs/common';
import { CarrinhoGatewayPort } from '../application/ports/saida/carrinho-gateway.ports';

@Injectable()
export class CarrinhoUseCase {
  constructor(
    private readonly carrinhoGateway: CarrinhoGatewayPort,
  ) {}

  async consultarCarrinho(userId: string) {
    return this.carrinhoGateway.consultarCarrinho(userId);
  }
  async adicionarProdutoCarrinho(body: { produtoId: string; quantidade: number },userId: string) {
    return this.carrinhoGateway.adicionarProdutoCarrinho(body, userId);
  }
  async sincronizarCarrinho(body: { itens: { produtoId: string; quantidade: number }[] },userId: string) {
    return this.carrinhoGateway.sincronizarCarrinho(body, userId);
  }
  async aumentarQuantidadeProduto(produtoId: string, userId: string) {
    return this.carrinhoGateway.aumentarQuantidadeProduto(produtoId, userId);
  }
  async diminuirQuantidadeProduto(produtoId: string, userId: string) {
    return this.carrinhoGateway.diminuirQuantidadeProduto(produtoId, userId);
  }
  async excluirProdutoCarrinho(produtoId: string, userId: string) {
    return this.carrinhoGateway.excluirProdutoCarrinho(produtoId, userId);
  }
  async limparCarrinho(userId: string) {
    return this.carrinhoGateway.limparCarrinho(userId);
  }
}