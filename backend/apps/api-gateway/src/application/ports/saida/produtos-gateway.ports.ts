export abstract class ProdutosGatewayPort {
  abstract listarProdutos(): Promise<unknown>;
  abstract listarProdutosPorId(id: string): Promise<unknown>;
}