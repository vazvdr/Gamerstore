import { Injectable } from '@nestjs/common';

import { ProdutoResponse } from './dto/ProdutoResponseDto';
import { BuscarProdutoPorIdUseCase } from './usecases/buscar-produto-por-id.usecase';
import { ListarProdutosUseCase } from './usecases/listar-produtos.usecase';

@Injectable()
export class ProdutosServiceService {
  constructor(
    private readonly listarProdutosUseCase: ListarProdutosUseCase,
    private readonly buscarProdutoPorIdUseCase: BuscarProdutoPorIdUseCase,
  ) { }

  listar(): Promise<ProdutoResponse[]> {
    return this.listarProdutosUseCase.execute();
  }
  
  buscarPorId(id: string): Promise<ProdutoResponse> {
    return this.buscarProdutoPorIdUseCase.execute(id);
  }
}
