import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import {
  DadosRefreshToken,
  DadosTokenUsuario,
  TokenAutenticacaoPorta,
} from '../../../application/ports/saida/token-autenticacao.ports';

@Injectable()
export class JwtTokenAutenticacaoAdapter implements TokenAutenticacaoPorta {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async gerarAccessToken(dados: DadosTokenUsuario): Promise<string> {
    return this.jwt.signAsync(dados, {
      secret: this.config.getOrThrow<string>('security.jwtAccessSecret'),
      expiresIn: '15m',
      algorithm: 'HS256',
    });
  }

  async gerarRefreshToken(dados: DadosTokenUsuario): Promise<string> {
    return this.jwt.signAsync(
      { ...dados, type: 'refresh', jti: randomUUID() },
      {
        secret: this.config.getOrThrow<string>('security.jwtRefreshSecret'),
        expiresIn: '7d',
        algorithm: 'HS256',
      },
    );
  }

  async verificarRefreshToken(token: string): Promise<DadosRefreshToken | null> {
    const secret = this.config.getOrThrow<string>('security.jwtRefreshSecret');

    try {
      const payload = await this.jwt.verifyAsync<DadosRefreshToken>(token, {
        secret,
        algorithms: ['HS256'],
      });

      if (
        payload.type !== 'refresh' ||
        !payload.sub ||
        !payload.email ||
        !payload.jti
      ) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }
}
