import { Injectable, NotFoundException } from '@nestjs/common';

import { ProdutoResponse } from '../dto/ProdutoResponseDto';
import { ProdutoRepository } from '../repository/produto.repository';

@Injectable()
export class BuscarProdutoPorIdUseCase {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async execute(id: string): Promise<ProdutoResponse> {
    if (!/^\d+$/.test(id)) {
      throw new NotFoundException('Produto não encontrado.');
    }
    const produto = await this.produtoRepository.buscarPorId(id);
    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }
    return produto;
  }
}
