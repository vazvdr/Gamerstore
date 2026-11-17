
import { Injectable } from '@nestjs/common';
import { AdicionarProdutoUseCase } from '../../../application/usecases/carrinho/adicionar-produto.usecase';
import { AumentarQuantidadeProdutoUseCase } from '../../../application/usecases/carrinho/aumentar-quantidade-produto.usecase';
import { ConsultarCarrinhoUseCase } from '../../../application/usecases/carrinho/consultar-carrinho.usecase';
import { DiminuirQuantidadeProdutoUseCase } from '../../../application/usecases/carrinho/diminuir-quantidade-produto.usecase';
import { ExcluirProdutoUseCase } from '../../../application/usecases/carrinho/excluir-produto.usecase';
import { LimparCarrinhoUseCase } from '../../../application/usecases/carrinho/limpar-carrinho.usecase';
import { SincronizarCarrinhoUseCase } from '../../../application/usecases/carrinho/sincronizar-carrinho.usecase';
import type { ItemParaSincronizacao } from '../../../application/usecases/carrinho/sincronizar-carrinho.usecase';

@Injectable()
export class CarrinhoService {
  constructor(
    private readonly adicionarProdutoUseCase: AdicionarProdutoUseCase,
    private readonly aumentarQuantidadeProdutoUseCase: AumentarQuantidadeProdutoUseCase,
    private readonly consultarCarrinhoUseCase: ConsultarCarrinhoUseCase,
    private readonly diminuirQuantidadeProdutoUseCase: DiminuirQuantidadeProdutoUseCase,
    private readonly excluirProdutoUseCase: ExcluirProdutoUseCase,
    private readonly limparCarrinhoUseCase: LimparCarrinhoUseCase,
    private readonly sincronizarCarrinhoUseCase: SincronizarCarrinhoUseCase,
  ) {}

  async consultar(usuarioId: string) {
    return this.consultarCarrinhoUseCase.execute(usuarioId);
  }

  async adicionar(
    usuarioId: string,
    produtoId: string,
    quantidade: number,
  ) {
    return this.adicionarProdutoUseCase.execute({
      usuarioId,
      produtoId,
      quantidade,
    });
  }

  async sincronizar(
    usuarioId: string,
    itens: ItemParaSincronizacao[],
  ) {
    return this.sincronizarCarrinhoUseCase.execute(usuarioId, itens);
  }

  async aumentar(usuarioId: string, produtoId: string) {
    return this.aumentarQuantidadeProdutoUseCase.execute(
      usuarioId,
      produtoId,
    );
  }

  async diminuir(usuarioId: string, produtoId: string) {
    return this.diminuirQuantidadeProdutoUseCase.execute(
      usuarioId,
      produtoId,
    );
  }

  async excluir(usuarioId: string, produtoId: string) {
    return this.excluirProdutoUseCase.execute(
      usuarioId,
      produtoId,
    );
  }

  async limpar(usuarioId: string) {
    return this.limparCarrinhoUseCase.execute(usuarioId);
  }
}
