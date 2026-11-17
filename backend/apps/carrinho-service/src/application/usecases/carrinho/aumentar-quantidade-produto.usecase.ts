
import { Inject, Injectable } from '@nestjs/common';
import {
  CarrinhoRepositoryPort,
  CARRINHO_REPOSITORY,
} from '../../ports/saida/carrinho-repository.ports';
import {
  ProdutoQueryPort,
  PRODUTO_QUERY,
} from '../../ports/saida/produto-query.ports';
import type { Carrinho } from '../../../domain/entities/carrinho';
import { EstoqueInsuficienteError } from './adicionar-produto.usecase';

export class ProdutoNaoEncontradoNoCarrinhoError extends Error {
  constructor() {
    super('Produto não encontrado no carrinho.');
    this.name = 'ProdutoNaoEncontradoNoCarrinhoError';
  }
}

@Injectable()
export class AumentarQuantidadeProdutoUseCase {
  constructor(
    @Inject(CARRINHO_REPOSITORY)
    private readonly carrinhoRepository: CarrinhoRepositoryPort,

    @Inject(PRODUTO_QUERY)
    private readonly produtoQuery: ProdutoQueryPort,
  ) {}

  async execute(usuarioId: string, produtoId: string): Promise<Carrinho> {
    const carrinho =
      await this.carrinhoRepository.buscarPorUsuarioId(usuarioId);

    if (!carrinho) {
      throw new ProdutoNaoEncontradoNoCarrinhoError();
    }

    const item = carrinho.itens.find(
      (item) => item.produtoId === produtoId,
    );

    if (!item) {
      throw new ProdutoNaoEncontradoNoCarrinhoError();
    }

    const produto = await this.produtoQuery.buscarPorId(produtoId);

    const estoqueDisponivel = Math.max(
      0,
      produto.stock - (produto.reservedStock ?? 0),
    );

    if (item.quantidade + 1 > estoqueDisponivel) {
      throw new EstoqueInsuficienteError();
    }

    const novosItens = carrinho.itens.map((itemCarrinho) =>
      itemCarrinho.produtoId === produtoId
        ? {
            ...itemCarrinho,
            quantidade: itemCarrinho.quantidade + 1,
            preco: produto.price,
          }
        : itemCarrinho,
    );

    const carrinhoAtualizado: Carrinho = {
      ...carrinho,
      itens: novosItens,
    };

    await this.carrinhoRepository.salvar(carrinhoAtualizado);

    return carrinhoAtualizado;
  }
}
