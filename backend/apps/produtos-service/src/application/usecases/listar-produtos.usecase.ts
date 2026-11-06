import { Inject, Injectable } from '@nestjs/common';
import { PRODUTO_REPOSITORIO, type ProdutoRepositorioPorta } from '../ports/saida/produto-repository.ports';
import type { Produto } from '../../domain/entities/produto';

@Injectable()
export class ListarProdutosUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORIO)
    private readonly produtoRepository: ProdutoRepositorioPorta,
  ) {}

  execute(): Promise<Produto[]> {
    return this.produtoRepository.listarProdutos();
  }
}