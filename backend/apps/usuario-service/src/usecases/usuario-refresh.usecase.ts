import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RedisService } from '../redis/redis.service';
import { UserMapper } from '../users/user.mapper';
import { UserRepository } from '../users/user.repository';

interface RefreshPayload {
  sub: string;
  email: string;
  type: 'refresh';
  jti: string;
}

@Injectable()
export class RefreshUsuarioUseCase {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly users: UserRepository,
    private readonly redis: RedisService,
  ) {}

  async execute(dto: RefreshTokenDto) {
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    const accessSecret = this.config.get<string>('JWT_ACCESS_SECRET');

    if (!refreshSecret || !accessSecret) {
      throw new InternalServerErrorException('Os segredos JWT não estão configurados.');
    }

    let payload: RefreshPayload;

    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(dto.refreshToken, {
        secret: refreshSecret,
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException('Refresh token expirado ou inválido.');
    }

    if (payload.type !== 'refresh' || !payload.sub || !payload.email || !payload.jti) {
      throw new UnauthorizedException('Refresh token inválido.');
    }

    const usuario = await this.users.buscarPorEmail(payload.email);

    if (!usuario || String(usuario.id) !== payload.sub) {
      throw new UnauthorizedException('Usuário não encontrado ou token inválido.');
    }

    const tokenPayload = { sub: String(usuario.id), email: usuario.email };

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(tokenPayload, {
        secret: accessSecret,
        expiresIn: '15m',
        algorithm: 'HS256',
      }),
      this.jwt.signAsync(
        { ...tokenPayload, type: 'refresh', jti: randomUUID() },
        {
          secret: refreshSecret,
          expiresIn: '7d',
          algorithm: 'HS256',
        },
      ),
    ]);

    const rotacionado = await this.redis.rotacionarRefreshToken(
      dto.refreshToken,
      refresh_token,
      String(usuario.id),
    );

    if (rotacionado !== 1) {
      throw new UnauthorizedException('Refresh token já utilizado ou revogado.');
    }

    return {
      ...UserMapper.paraPerfil(usuario),
      access_token,
      refresh_token,
    };
  }
}
