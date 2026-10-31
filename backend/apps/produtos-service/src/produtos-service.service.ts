import { Injectable } from '@nestjs/common';
import { ProdutoResponse } from './dto/ProdutoResponseDto';
import { ListarProdutoPorIdUseCase } from './usecases/listar-produto-por-id.usecase';
import { ListarProdutosUseCase } from './usecases/listar-produtos.usecase';

@Injectable()
export class ProdutosServiceService {
  constructor(
    private readonly listarProdutosUseCase: ListarProdutosUseCase,
    private readonly listarProdutoPorIdUseCase: ListarProdutoPorIdUseCase,
  ) { }

  listar(): Promise<ProdutoResponse[]> {
    return this.listarProdutosUseCase.execute();
  }
  listarPorId(id: string): Promise<ProdutoResponse> {
    return this.listarProdutoPorIdUseCase.execute(id);
  }
}
