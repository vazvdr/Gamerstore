import { Injectable } from '@nestjs/common';
import { SessaoUsuarioPorta } from '../../../../application/ports/saida/sessao-usuario.ports';
import { TentativaLoginPorta, ResultadoTentativaLogin } from '../../../../application/ports/saida/tentativa-login.ports';
import { TokenRecuperacaoSenhaPorta } from '../../../../application/ports/saida/token-recuperacao-senha.ports';
import { RedisService } from './redis.service';

@Injectable()
export class RedisUsuarioAdapter implements
  SessaoUsuarioPorta,
  TokenRecuperacaoSenhaPorta,
  TentativaLoginPorta {
  constructor(private readonly redis: RedisService) {}

  async registrarRefreshToken(token: string, usuarioId: string): Promise<boolean> {
    return this.redis.registrarRefreshToken(token, usuarioId);
  }
  async rotacionarRefreshToken(
    tokenAtual: string,
    novoToken: string,
    usuarioId: string,
  ): Promise<number> {
    return this.redis.rotacionarRefreshToken(tokenAtual, novoToken, usuarioId);
  }
  async registrar(tokenHash: string, usuarioId: string, ttl: number): Promise<boolean> {
    return this.redis.registrarTokenRecuperacao(tokenHash, usuarioId, ttl);
  }
  async buscar(tokenHash: string): Promise<string | null> {
    return this.redis.buscarTokenRecuperacao(tokenHash);
  }
  async consumir(tokenHash: string, usuarioId: string): Promise<boolean> {
    return this.redis.consumirTokenRecuperacao(tokenHash, usuarioId);
  }
  async consultarBloqueio(ip: string): Promise<number> {
    return this.redis.consultarBloqueioLogin(ip);
  }
  async registrarFalha(
    ip: string,
    limite: number,
    tempoBloqueio: number,
  ): Promise<ResultadoTentativaLogin> {
    return this.redis.registrarFalhaLogin(ip, limite, tempoBloqueio);
  }
  async limparTentativas(ip: string): Promise<void> {
    return this.redis.limparTentativasLogin(ip);
  }
}
