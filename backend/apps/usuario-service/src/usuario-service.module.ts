import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration, { validateConfiguration } from './../src/config/configuration';

import { UsuarioServiceController } from './adapters/entrada/http/usuario-service.controller';
import { UsuarioServiceService } from './adapters/entrada/http/usuario-service.service';
import { InternalApiGuard } from './adapters/entrada/http/guards/internal-api-guard';
import { UsuarioUseCasesModule } from './modules/usuario-usecases.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/usuario-service/.env',
      load: [configuration],
      validate: validateConfiguration,
    }),
    UsuarioUseCasesModule,
  ],
  controllers: [UsuarioServiceController],
  providers: [
    InternalApiGuard,
    UsuarioServiceService,
  ],
})
export class UsuarioServiceModule {}
