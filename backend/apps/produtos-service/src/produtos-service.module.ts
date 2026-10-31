import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProdutosServiceController } from './produtos-service.controller';
import { ProdutosServiceService } from './produtos-service.service';
import { PrismaService } from './prisma/prisma.service';
import { ProdutoRepository } from './repository/produto.repository';
import { ListarProdutoPorIdUseCase } from './usecases/listar-produto-por-id.usecase';
import { ListarProdutosUseCase } from './usecases/listar-produtos.usecase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/produtos-service/.env',
    }),
  ],
  controllers: [ProdutosServiceController],
  providers: [ProdutosServiceService, ListarProdutosUseCase, ListarProdutoPorIdUseCase, ProdutoRepository, PrismaService],
})
export class ProdutosServiceModule { }
