import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration, { validateConfiguration } from './config/configuration';
import { ApiGatewayController } from './api-gateway.controller';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { HttpClientService } from './adapters/saida/http/clients/http-client.service';
import { InternalApiHeadersService } from './adapters/saida/http/configuration/internal-api-headers.service';
import { ProdutosGatewayAdapter } from './adapters/saida/services/produtos-gateway.adapter';
import { UsuariosGatewayAdapter } from './adapters/saida/services/usuario-gateway.adapter';
import { EnderecosGatewayAdapter } from './adapters/saida/services/enderecos-gateway.adapter';
import { CarrinhoGatewayAdapter } from './adapters/saida/services/carrinho-gateway.adapter';
import { ProdutosGatewayPort } from './application/ports/saida/produtos-gateway.ports';
import { UsuariosGatewayPort } from './application/ports/saida/usuarios-gateway.ports';
import { EnderecosGatewayPort } from './application/ports/saida/enderecos-gateway.ports';
import { CarrinhoGatewayPort } from './application/ports/saida/carrinho-gateway.ports';
import { ProdutosUseCase } from './usecases/produtos.usecase';
import { UsuariosUseCase } from './usecases/usuarios.usecase';
import { EnderecosUseCase } from './usecases/enderecos.usecase';
import { CarrinhoUseCase } from './usecases/carrinho.usecase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api-gateway/.env',
      load: [configuration],
      validate: validateConfiguration,
    }),
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('security.jwtAccessSecret'),
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
  ],
  controllers: [ApiGatewayController],
  providers: [
    JwtAuthGuard,
    HttpClientService,
    InternalApiHeadersService,
    ProdutosGatewayAdapter,
    UsuariosGatewayAdapter,
    EnderecosGatewayAdapter,
    CarrinhoGatewayAdapter,
    { provide: ProdutosGatewayPort, useExisting: ProdutosGatewayAdapter },
    { provide: UsuariosGatewayPort, useExisting: UsuariosGatewayAdapter },
    { provide: EnderecosGatewayPort, useExisting: EnderecosGatewayAdapter },
    { provide: CarrinhoGatewayPort, useExisting: CarrinhoGatewayAdapter },
    { provide: ProdutosUseCase, useFactory: (port: ProdutosGatewayPort) => new ProdutosUseCase(port), inject: [ProdutosGatewayPort] },
    { provide: UsuariosUseCase, useFactory: (port: UsuariosGatewayPort) => new UsuariosUseCase(port), inject: [UsuariosGatewayPort] },
    { provide: EnderecosUseCase, useFactory: (port: EnderecosGatewayPort) => new EnderecosUseCase(port), inject: [EnderecosGatewayPort] },
    { provide: CarrinhoUseCase, useFactory: (port: CarrinhoGatewayPort) => new CarrinhoUseCase(port), inject: [CarrinhoGatewayPort] },
  ],
})
export class ApiGatewayModule { }
