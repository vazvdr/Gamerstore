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
  async rotacionarRefreshToken(tokenAtual: string, novoToken: string, usuarioId: string) {
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
    return await this.client.eval(script, {
      keys: [this.gerarChave(tokenAtual), this.gerarChave(novoToken)],
      arguments: [usuarioId, String(this.refreshTtl)],
    });
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
}
