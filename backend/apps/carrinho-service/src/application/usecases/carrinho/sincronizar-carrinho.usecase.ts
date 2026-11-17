import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CARRINHO_REPOSITORY, type CarrinhoRepositoryPort } from '../../ports/saida/carrinho-repository.ports';
import { PRODUTO_QUERY, type ProdutoQueryPort } from '../../ports/saida/produto-query.ports';
import type { Carrinho } from '../../../domain/entities/carrinho';
import type { ItemCarrinho } from '../../../domain/entities/item-carrinho';

export interface ItemParaSincronizacao {
  produtoId: string;
  quantidade: number;
}

@Injectable()
export class SincronizarCarrinhoUseCase {
  constructor(
    @Inject(CARRINHO_REPOSITORY)
    private readonly carrinhoRepository: CarrinhoRepositoryPort,
    @Inject(PRODUTO_QUERY)
    private readonly produtoQuery: ProdutoQueryPort,
  ) {}

  async execute(
    usuarioId: string,
    itensLocais: ItemParaSincronizacao[],
  ): Promise<Carrinho> {
    const carrinhoAtual = await this.carrinhoRepository.buscarPorUsuarioId(usuarioId);
    if (itensLocais.length === 0) {
      return carrinhoAtual;
    }
    const quantidades = new Map<string, number>();
    for (const item of carrinhoAtual.itens) {
      quantidades.set(
        item.produtoId,
        (quantidades.get(item.produtoId) ?? 0) + item.quantidade,
      );
    }
    for (const item of itensLocais) {
      if (!Number.isInteger(item.quantidade) || item.quantidade < 1) {
        throw new ConflictException(
          `A quantidade do produto ${item.produtoId} é inválida.`,
        );
      }
      quantidades.set(
        item.produtoId,
        (quantidades.get(item.produtoId) ?? 0) + item.quantidade,
      );
    }
    const produtosLocais = new Set(itensLocais.map((item) => item.produtoId));
    const itensSincronizados: ItemCarrinho[] = [];
    for (const itemAtual of carrinhoAtual.itens) {
      if (!produtosLocais.has(itemAtual.produtoId)) {
        itensSincronizados.push(itemAtual);
      }
    }
    for (const [produtoId, quantidade] of quantidades) {
      if (!produtosLocais.has(produtoId)) {
        continue;
      }
      const produto = await this.produtoQuery.buscarPorId(produtoId);
      const estoqueDisponivel = Math.max(
        0,
        produto.stock - (produto.reservedStock ?? 0),
      );
      if (quantidade > estoqueDisponivel) {
        throw new ConflictException({
          message: `Estoque insuficiente para sincronizar o produto ${produto.name}.`,
          produtoId,
          quantidadeSolicitada: quantidade,
          estoqueDisponivel,
        });
      }
      itensSincronizados.push({
        produtoId: produto.id,
        nome: produto.name,
        marca: produto.brand,
        modelo: produto.model,
        imagemUrl: produto.imageUrl,
        preco: produto.price,
        quantidade,
      });
    }
    const carrinhoSincronizado: Carrinho = {
      usuarioId,
      itens: itensSincronizados,
    };
    await this.carrinhoRepository.salvar(carrinhoSincronizado);
    return carrinhoSincronizado;
  }
}
