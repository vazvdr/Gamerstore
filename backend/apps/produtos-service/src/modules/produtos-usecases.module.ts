import { Module } from '@nestjs/common';

import { ProdutosAdaptersModule } from './produtos-adapters.module';
import { ListarProdutosUseCase } from '../application/usecases/listar-produtos.usecase';
import { ListarProdutoPorIdUseCase } from '../application/usecases/listar-produto-por-id.usecase';

@Module({
  imports: [ProdutosAdaptersModule],
  providers: [ListarProdutosUseCase, ListarProdutoPorIdUseCase],
  exports: [ListarProdutosUseCase, ListarProdutoPorIdUseCase],
})
export class ProdutosUseCasesModule {}