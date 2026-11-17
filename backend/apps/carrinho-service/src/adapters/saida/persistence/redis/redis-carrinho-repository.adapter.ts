import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Carrinho } from '../../../../domain/entities/carrinho';
import { CarrinhoRepositoryPort } from '../../../../application/ports/saida/carrinho-repository.ports';
import { RedisService } from './redis.service';

@Injectable()
export class RedisCarrinhoRepositoryAdapter
  implements CarrinhoRepositoryPort
{
  constructor(
    private readonly redisService: RedisService,
    private readonly config: ConfigService,
  ) {}

  private gerarChave(usuarioId: string): string {
    return `carrinho:${usuarioId}`;
  }
  async buscarPorUsuarioId(usuarioId: string): Promise<Carrinho> {
    const chave = this.gerarChave(usuarioId);
    const resultado = await this.redisService.buscar(chave);
    if (!resultado) {
      return {
        usuarioId,
        itens: [],
      };
    }
    return JSON.parse(resultado) as Carrinho;
  }
  async salvar(carrinho: Carrinho): Promise<void> {
    const chave = this.gerarChave(carrinho.usuarioId);
    const ttl = this.config.getOrThrow<number>('redis.carrinhoTtl');
    await this.redisService.salvar(
      chave,
      JSON.stringify(carrinho),
      ttl,
    );
  }
  async limpar(usuarioId: string): Promise<void> {
    const chave = this.gerarChave(usuarioId);
    await this.redisService.remover(chave);
  }
}