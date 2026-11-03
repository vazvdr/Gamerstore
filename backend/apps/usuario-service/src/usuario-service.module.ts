import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './database/prisma.module';
import { InternalApiGuard } from './guards/internal-api-guard';
import { UsuarioServiceController } from './usuario-service.controller';
import { UsuarioServiceService } from './usuario-service.service';
import { UserRepository } from './users/usuario/user.repository';
import { EnderecoRepository } from './users/endereco/endereco.repository';
import { UserSecurity } from './users/usuario/user.security';
import { CadastrarUsuarioUseCase } from './usecases/usuarios/cadastrar-usuario.usecase';
import { EditarUsuarioUseCase } from './usecases/usuarios/editar-usuario.usecase';
import { LogarUsuarioUseCase } from './usecases/usuarios/logar-usuario.usecase';
import { RefreshUsuarioUseCase } from './usecases/usuarios/usuario-refresh.usecase';
import { DeletarUsuarioUseCase } from './usecases/usuarios/deletar-usuario.usecase';
import { RecuperarSenhaUseCase } from './usecases/usuarios/recuperar-senha.usecase';
import { RedefinirSenhaUseCase } from './usecases/usuarios/redefinir-senha.usecase';
import { CadastrarEnderecoUseCase } from './usecases/enderecos/cadastrar-endereco.usecase';
import { EditarEnderecoUseCase } from './usecases/enderecos/editar-endereco.usecase';
import { DeletarEnderecoUseCase } from './usecases/enderecos/deletar-endereco.usecase';
import { ListarEnderecosUseCase } from './usecases/enderecos/listar-enderecos.usecase';
import { RedisModule } from './redis/redis.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/usuario-service/.env',
    }),
    JwtModule.register({}),
    PrismaModule,
    RedisModule,
    RabbitMQModule,
  ],
  controllers: [UsuarioServiceController],
  providers: [
    InternalApiGuard,
    UsuarioServiceService,
    UserRepository,
    EnderecoRepository,
    UserSecurity,
    CadastrarUsuarioUseCase,
    LogarUsuarioUseCase,
    RefreshUsuarioUseCase,
    EditarUsuarioUseCase,
    DeletarUsuarioUseCase,
    RecuperarSenhaUseCase,
    RedefinirSenhaUseCase,
    CadastrarEnderecoUseCase,
    EditarEnderecoUseCase,
    DeletarEnderecoUseCase,
    ListarEnderecosUseCase,
  ],
})
export class UsuarioServiceModule {}
