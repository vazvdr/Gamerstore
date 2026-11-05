import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: RedisClientType;
  private readonly refreshTtl = 7 * 24 * 60 * 60;

  async onModuleInit() {
    this.client = createClient({
      url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    });
    this.client.on('error', (error) => {
      console.error('Redis error:', error);
    });
    await this.client.connect();
  }
  async onModuleDestroy() {
    if (this.client?.isOpen) await this.client.quit();
  }
  private gerarChave(token: string) {
    const hash = createHash('sha256').update(token).digest('hex');
    return `refresh-token:${hash}`;
  }
  async registrarRefreshToken(token: string, usuarioId: string) {
    const resultado = await this.client.set(
      this.gerarChave(token),
      usuarioId,
      { EX: this.refreshTtl, NX: true },
    );
    return resultado === 'OK';
  }
  async rotacionarRefreshToken(tokenAtual: string, novoToken: string, usuarioId: string): Promise<number> {
    const script = `
    if redis.call('EXISTS', KEYS[1]) == 0 then
      return 0
    end
    if redis.call('EXISTS', KEYS[2]) == 1 then
      return -1
    end
    redis.call('DEL', KEYS[1])
    redis.call('SET', KEYS[2], ARGV[1], 'EX', ARGV[2])
    return 1
  `;
    const resultado = await this.client.eval(script, {
      keys: [this.gerarChave(tokenAtual), this.gerarChave(novoToken)],
      arguments: [usuarioId, String(this.refreshTtl)],
    });
    return Number(resultado);
  }
  async registrarTokenRecuperacao(tokenHash: string, usuarioId: string, ttl: number) {
    const resultado = await this.client.set(
      `password-reset:${tokenHash}`,
      usuarioId,
      { EX: ttl, NX: true },
    );
    return resultado === 'OK';
  }
  async buscarTokenRecuperacao(tokenHash: string) {
    return this.client.get(`password-reset:${tokenHash}`);
  }
  async consumirTokenRecuperacao(tokenHash: string, usuarioId: string) {
    const resultado = await this.client.eval(
      `
        if redis.call('GET', KEYS[1]) ~= ARGV[1] then
          return 0
        end
        redis.call('DEL', KEYS[1])
        return 1
      `,
      {
        keys: [`password-reset:${tokenHash}`],
        arguments: [usuarioId],
      },
    );
    return resultado === 1;
  }
  async incrementar(chave: string) {
    return await this.client.incr(chave);
  }
  async expirar(chave: string, segundos: number) {
    return await this.client.expire(chave, segundos);
  }
  async ttl(chave: string) {
    return await this.client.ttl(chave);
  }
  async deletar(chave: string) {
    return await this.client.del(chave);
  }
  private gerarChaveLogin(tipo: 'attempts' | 'block', ip: string) {
    const hash = createHash('sha256').update(ip).digest('hex');
    return `login:${tipo}:${hash}`;
  }
  async consultarBloqueioLogin(ip: string): Promise<number> {
    const resultado = await this.client.ttl(this.gerarChaveLogin('block', ip));
    return resultado > 0 ? resultado : 0;
  }
  async registrarFalhaLogin(
    ip: string,
    limite: number,
    tempoBloqueio: number,
  ): Promise<{ bloqueado: boolean; tentativas: number; tempoRestante: number }> {
    const resultado = await this.client.eval(
      `
      local tempoRestante = redis.call('TTL', KEYS[1])

      if tempoRestante > 0 then
        return { 0, 0, tempoRestante }
      end

      local tentativas = redis.call('INCR', KEYS[2])

      if tentativas >= tonumber(ARGV[1]) then
        redis.call('SET', KEYS[1], '1', 'EX', ARGV[2])
        redis.call('DEL', KEYS[2])
        return { 0, tentativas, tonumber(ARGV[2]) }
      end

      return { 1, tentativas, 0 }
    `,
      {
        keys: [
          this.gerarChaveLogin('block', ip),
          this.gerarChaveLogin('attempts', ip),
        ],
        arguments: [String(limite), String(tempoBloqueio)],
      },
    );
    if (!Array.isArray(resultado)) {
      throw new Error('Resposta inválida ao registrar tentativa de login.');
    }
    return {
      bloqueado: Number(resultado[0]) === 0,
      tentativas: Number(resultado[1]),
      tempoRestante: Number(resultado[2]),
    };
  }
  async limparTentativasLogin(ip: string): Promise<void> {
    await this.client.del([
      this.gerarChaveLogin('attempts', ip),
      this.gerarChaveLogin('block', ip),
    ]);
  }

}
