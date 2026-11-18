export abstract class CarrinhoGatewayPort {

    abstract consultarCarrinho(userId: string): Promise<unknown>;
    abstract adicionarProdutoCarrinho(body: { produtoId: string; quantidade: number }, userId: string): Promise<unknown>;
    abstract sincronizarCarrinho(body: { itens: { produtoId: string; quantidade: number }[] }, userId: string): Promise<unknown>;
    abstract aumentarQuantidadeProduto(produtoId: string, userId: string): Promise<unknown>;
    abstract diminuirQuantidadeProduto(produtoId: string, userId: string): Promise<unknown>;
    abstract excluirProdutoCarrinho(produtoId: string, userId: string): Promise<unknown>;
    abstract limparCarrinho(userId: string): Promise<unknown>;

}
