import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CARRINHO_REPOSITORY } from '../application/ports/saida/carrinho-repository.ports';
import { PRODUTO_QUERY } from '../application/ports/saida/produto-query.ports';
import { RedisModule } from '../adapters/saida/persistence/redis/redis.module';
import { RedisCarrinhoRepositoryAdapter } from '../adapters/saida/persistence/redis/redis-carrinho-repository.adapter';
import { ProdutoQueryHttpAdapter } from '../adapters/saida/http/produtos/produto-query-http.adapter';

@Module({
  imports: [
    RedisModule,
    HttpModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        baseURL: config.getOrThrow<string>('services.produtosUrl'),
        timeout: 5000,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    RedisCarrinhoRepositoryAdapter,
    ProdutoQueryHttpAdapter,
    {
      provide: CARRINHO_REPOSITORY,
      useExisting: RedisCarrinhoRepositoryAdapter,
    },
    {
      provide: PRODUTO_QUERY,
      useExisting: ProdutoQueryHttpAdapter,
    },
  ],
  exports: [
    CARRINHO_REPOSITORY,
    PRODUTO_QUERY,
  ],
})
export class CarrinhoAdaptersModule {}
