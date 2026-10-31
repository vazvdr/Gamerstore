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
import { EditarUsuarioUseCase } from './usecases/editar-usuario.usecase';
import { LogarUsuarioUseCase } from './usecases/logar-usuario.usecase';
import { RefreshUsuarioUseCase } from './usecases/usuario-refresh.usecase';
import { RedisModule } from './redis/redis.module';
import { DeletarUsuarioUseCase } from './usecases/deletar-usuario.usecase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/usuario-service/.env',
    }),
    JwtModule.register({}),
    PrismaModule, RedisModule
  ],
  controllers: [UsuarioServiceController],
  providers: [ InternalApiGuard, UsuarioServiceService, UserRepository, UserSecurity, 
    CadastrarUsuarioUseCase, LogarUsuarioUseCase, RefreshUsuarioUseCase, EditarUsuarioUseCase, DeletarUsuarioUseCase],
})
export class UsuarioServiceModule {}
