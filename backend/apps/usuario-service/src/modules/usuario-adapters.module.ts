import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../adapters/saida/persistence/prisma/prisma.module';
import { RedisModule } from '../adapters/saida/persistence/redis/redis.module';
import { RabbitMQModule } from '../adapters/saida/messaging/rabbitmq/rabbitmq.module';

import { PrismaUsuarioRepositoryAdapter } from '../adapters/saida/persistence/prisma/prisma-usuario-repository.adapter';
import { PrismaEnderecoRepositoryAdapter } from '../adapters/saida/persistence/prisma/prisma-endereco-repository.adapter';
import { RedisUsuarioAdapter } from '../adapters/saida/persistence/redis/redis-usuario.adapter';
import { Argon2SenhaCriptografiaAdapter } from '../adapters/saida/security/argon2-senha-criptografia.adapter';
import { JwtTokenAutenticacaoAdapter } from '../adapters/saida/security/jwt-token-autenticacao.adapter';
import { RabbitMQNotificacaoRecuperacaoSenhaAdapter } from '../adapters/saida/messaging/rabbitmq/rabbitmq-notificacao-recuperacao-senha.adapter';
import { ConfiguracaoRecuperacaoSenhaAdapter } from '../adapters/saida/configuration/configuracao-recuperacao-senha.adapter';

import { USUARIO_REPOSITORIO } from '../application/ports/saida/usuario-repository.ports';
import { ENDERECO_REPOSITORIO } from '../application/ports/saida/endereco-repository.ports';
import { SENHA_CRIPTOGRAFIA } from '../application/ports/saida/senha-criptografia.ports';
import { TOKEN_AUTENTICACAO } from '../application/ports/saida/token-autenticacao.ports';
import { SESSAO_USUARIO } from '../application/ports/saida/sessao-usuario.ports';
import { TOKEN_RECUPERACAO_SENHA } from '../application/ports/saida/token-recuperacao-senha.ports';
import { TENTATIVA_LOGIN } from '../application/ports/saida/tentativa-login.ports';
import { NOTIFICACAO_RECUPERACAO_SENHA } from '../application/ports/saida/notificacao-recuperacao-senha.ports';
import { CONFIGURACAO_RECUPERACAO_SENHA } from '../application/ports/saida/configuracao-recuperacao-senha.ports';

@Module({
  imports: [
    JwtModule.register({}),
    PrismaModule,
    RedisModule,
    RabbitMQModule,
  ],
  providers: [
    PrismaUsuarioRepositoryAdapter,
    PrismaEnderecoRepositoryAdapter,
    RedisUsuarioAdapter,
    Argon2SenhaCriptografiaAdapter,
    JwtTokenAutenticacaoAdapter,
    RabbitMQNotificacaoRecuperacaoSenhaAdapter,
    ConfiguracaoRecuperacaoSenhaAdapter,

    { provide: USUARIO_REPOSITORIO, useExisting: PrismaUsuarioRepositoryAdapter },
    { provide: ENDERECO_REPOSITORIO, useExisting: PrismaEnderecoRepositoryAdapter },
    { provide: SENHA_CRIPTOGRAFIA, useExisting: Argon2SenhaCriptografiaAdapter },
    { provide: TOKEN_AUTENTICACAO, useExisting: JwtTokenAutenticacaoAdapter },
    { provide: TENTATIVA_LOGIN, useExisting: RedisUsuarioAdapter },
    { provide: SESSAO_USUARIO, useExisting: RedisUsuarioAdapter },
    { provide: TOKEN_RECUPERACAO_SENHA, useExisting: RedisUsuarioAdapter },
    { provide: NOTIFICACAO_RECUPERACAO_SENHA, useExisting: RabbitMQNotificacaoRecuperacaoSenhaAdapter },
    { provide: CONFIGURACAO_RECUPERACAO_SENHA, useExisting: ConfiguracaoRecuperacaoSenhaAdapter },
  ],
  exports: [
    USUARIO_REPOSITORIO,
    ENDERECO_REPOSITORIO,
    SENHA_CRIPTOGRAFIA,
    TOKEN_AUTENTICACAO,
    TENTATIVA_LOGIN,
    SESSAO_USUARIO,
    TOKEN_RECUPERACAO_SENHA,
    NOTIFICACAO_RECUPERACAO_SENHA,
    CONFIGURACAO_RECUPERACAO_SENHA,
  ],
})
export class UsuarioAdaptersModule {}