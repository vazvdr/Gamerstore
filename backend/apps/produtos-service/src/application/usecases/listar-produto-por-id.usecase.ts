import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRODUTO_REPOSITORIO, type ProdutoRepositorioPorta } from '../ports/saida/produto-repository.ports';
import type { Produto } from '../../domain/entities/produto';

@Injectable()
export class ListarProdutoPorIdUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORIO)
    private readonly produtoRepository: ProdutoRepositorioPorta,
  ) {}

  async execute(id: string): Promise<Produto> {
    if (!/^\d+$/.test(id)) {
      throw new NotFoundException('Produto não encontrado.');
    }
    const produto = await this.produtoRepository.listarPorId(id);
    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }
    return produto;
  }
}