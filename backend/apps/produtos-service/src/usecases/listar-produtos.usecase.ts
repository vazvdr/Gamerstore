import { Injectable } from '@nestjs/common';

import { ProdutoResponse } from '../dto/ProdutoResponseDto.js';
import { ProdutoRepository } from '../repository/produto.repository.js';

@Injectable()
export class ListarProdutosUseCase {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  execute(): Promise<ProdutoResponse[]> {
    return this.produtoRepository.listarProdutos();
  }
}
