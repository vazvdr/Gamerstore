import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration, { validateConfiguration } from './config/configuration';
import { ProdutosServiceController } from './adapters/entrada/http/produtos-service.controller';
import { ProdutosServiceService } from './adapters/entrada/http/produtos-service.service';
import { ProdutosUseCasesModule } from './modules/produtos-usecases.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/produtos-service/.env',
      load: [configuration],
      validate: validateConfiguration,
    }),
    ProdutosUseCasesModule,
  ],
  controllers: [ProdutosServiceController],
  providers: [ProdutosServiceService],
})
export class ProdutosServiceModule {}
