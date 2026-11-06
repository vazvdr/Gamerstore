import { Injectable } from '@nestjs/common';

import type { ProdutoResponse } from './dto/produto-response.dto';
import { ListarProdutoPorIdUseCase } from '../../../application/usecases/listar-produto-por-id.usecase';
import { ListarProdutosUseCase } from '../../../application/usecases/listar-produtos.usecase';

@Injectable()
export class ProdutosServiceService {
  constructor(
    private readonly listarProdutosUseCase: ListarProdutosUseCase,
    private readonly listarProdutoPorIdUseCase: ListarProdutoPorIdUseCase,
  ) {}

  async listar(): Promise<ProdutoResponse[]> {
    const produtos = await this.listarProdutosUseCase.execute();

    return produtos.map((produto) => ({
      ...produto,
    }));
  }

  async listarPorId(id: string): Promise<ProdutoResponse> {
    const produto = await this.listarProdutoPorIdUseCase.execute(id);

    return {
      ...produto,
    };
  }
}