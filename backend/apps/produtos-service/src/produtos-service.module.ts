
import { Module } from '@nestjs/common';

import { ProdutosServiceController } from './produtos-service.controller';
import { ProdutosServiceService } from './produtos-service.service';
import { PrismaService } from './prisma/prisma.service';
import { ProdutoRepository } from './repository/produto.repository';
import { BuscarProdutoPorIdUseCase } from './usecases/buscar-produto-por-id.usecase';
import { ListarProdutosUseCase } from './usecases/listar-produtos.usecase';

@Module({
  controllers: [ProdutosServiceController],
  providers: [
    ProdutosServiceService,
    ListarProdutosUseCase,
    BuscarProdutoPorIdUseCase,
    ProdutoRepository,
    PrismaService,
  ],
})
export class ProdutosServiceModule {}
