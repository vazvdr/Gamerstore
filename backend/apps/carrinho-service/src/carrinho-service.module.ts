import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration, { validateConfiguration } from './config/configuration';
import { CarrinhoAdaptersModule } from './modules/carrinho-adapters.module';
import { CarrinhoUseCasesModule } from './modules/carrinho-usecases.module';
import { CarrinhoServiceController } from './adapters/entrada/http/carrinho-service.controller';
import { CarrinhoService } from './adapters/entrada/http/carrinho-service.service';
import { InternalApiGuard } from './adapters/entrada/guards/internal-api.guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/carrinho-service/.env',
      load: [configuration],
      validate: validateConfiguration,
    }),
    CarrinhoAdaptersModule,
    CarrinhoUseCasesModule,
  ],
  controllers: [CarrinhoServiceController],
  providers: [ CarrinhoService, InternalApiGuard],
})
export class CarrinhoServiceModule {}
