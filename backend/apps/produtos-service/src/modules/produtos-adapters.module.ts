import { Module } from '@nestjs/common';

import { PRODUTO_REPOSITORIO } from '../application/ports/saida/produto-repository.ports';
import { PrismaProdutoRepositoryAdapter } from '../adapters/saida/persistence/prisma/prisma-produto-repository.adapter';
import { PrismaModule } from '../adapters/saida/persistence/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    PrismaProdutoRepositoryAdapter,
    {
      provide: PRODUTO_REPOSITORIO,
      useExisting: PrismaProdutoRepositoryAdapter,
    },
  ],
  exports: [PRODUTO_REPOSITORIO],
})
export class ProdutosAdaptersModule {}