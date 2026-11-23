
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FreteController } from './adapters/entrada/http/controllers/frete.controller';
import { InternalApiGuard } from './adapters/entrada/guards/internal-api-guard';
import { TabelaFreteAdapter } from './adapters/saida/tabela-frete.adapter';
import { TABELA_FRETE_PORT } from './application/ports/saida/tabela-frete.port';
import { CalcularFreteUseCase } from './application/usecases/calcular-frete.usecase';
import configuration, { validateConfiguration } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/frete-service/.env',
      load: [configuration],
      validate: validateConfiguration,
    }),
  ],
  controllers: [FreteController],
  providers: [
    InternalApiGuard,
    CalcularFreteUseCase,
    TabelaFreteAdapter,
    { provide: TABELA_FRETE_PORT, useExisting: TabelaFreteAdapter },
  ],
})
export class FreteServiceModule {}
