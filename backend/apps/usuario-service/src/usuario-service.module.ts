import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './database/prisma.module';
import { InternalApiGuard } from './guards/internal-api-guard';
import { UsuarioServiceController } from './usuario-service.controller';
import { UsuarioServiceService } from './usuario-service.service';
import { UserRepository } from './users/user.repository';
import { UserSecurity } from './users/user.security';
import { CadastrarUsuarioUseCase } from './usecases/cadastrar-usuario.usecase';
import { LogarUsuarioUseCase } from './usecases/logar-usuario.usecase';
import { RefreshUsuarioUseCase } from './usecases/usuario-refresh.usecase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/usuario-service/.env',
    }),
    JwtModule.register({}),
    PrismaModule,
  ],
  controllers: [UsuarioServiceController],
  providers: [
    InternalApiGuard,
    UsuarioServiceService,
    UserRepository,
    UserSecurity,
    CadastrarUsuarioUseCase,
    LogarUsuarioUseCase,
    RefreshUsuarioUseCase
  ],
})
export class UsuarioServiceModule { }