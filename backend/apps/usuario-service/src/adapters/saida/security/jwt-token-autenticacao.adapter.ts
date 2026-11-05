
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { DadosRefreshToken, DadosTokenUsuario, TokenAutenticacaoPorta } from '../../../application/ports/saida/token-autenticacao.ports';

@Injectable()
export class JwtTokenAutenticacaoAdapter implements TokenAutenticacaoPorta {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async gerarAccessToken(dados: DadosTokenUsuario): Promise<string> {
    return this.jwt.signAsync(dados, {
      secret: this.obterSegredo('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
      algorithm: 'HS256',
    });
  }

  async gerarRefreshToken(dados: DadosTokenUsuario): Promise<string> {
    return this.jwt.signAsync(
      { ...dados, type: 'refresh', jti: randomUUID() },
      {
        secret: this.obterSegredo('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
        algorithm: 'HS256',
      },
    );
  }

  async verificarRefreshToken(token: string): Promise<DadosRefreshToken | null> {
    const secret = this.obterSegredo('JWT_REFRESH_SECRET');
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
  private obterSegredo(chave: string): string {
    const segredo = this.config.get<string>(chave);
    if (!segredo) {
      throw new InternalServerErrorException('Os segredos JWT não estão configurados.');
    }
    return segredo;
  }
}
