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
import type { ItemCarrinho } from '../../../domain/entities/item-carrinho';

export interface AdicionarProdutoInput {
  usuarioId: string;
  produtoId: string;
  quantidade: number;
}

export class QuantidadeInvalidaError extends Error {
  constructor() {
    super('A quantidade deve ser um número inteiro maior que zero.');
    this.name = 'QuantidadeInvalidaError';
  }
}

export class EstoqueInsuficienteError extends Error {
  constructor() {
    super('Estoque insuficiente para a quantidade solicitada.');
    this.name = 'EstoqueInsuficienteError';
  }
}

@Injectable()
export class AdicionarProdutoUseCase {
  constructor(
    @Inject(CARRINHO_REPOSITORY)
    private readonly carrinhoRepository: CarrinhoRepositoryPort,

    @Inject(PRODUTO_QUERY)
    private readonly produtoQuery: ProdutoQueryPort,
  ) {}

  async execute(input: AdicionarProdutoInput): Promise<Carrinho> {
    const { usuarioId, produtoId, quantidade } = input;
    if (!Number.isInteger(quantidade) || quantidade < 1) {
      throw new QuantidadeInvalidaError();
    }
    const produto = await this.produtoQuery.buscarPorId(produtoId);
    const estoqueDisponivel = Math.max(
      0,
      produto.stock - (produto.reservedStock ?? 0),
    );
    const carrinhoExistente = await this.carrinhoRepository.buscarPorUsuarioId(usuarioId);
    const itens = carrinhoExistente?.itens ?? [];
    const itemExistente = itens.find(
      (item) => item.produtoId === produtoId,
    );
    const quantidadeAtual = itemExistente?.quantidade ?? 0;
    const quantidadeTotal = quantidadeAtual + quantidade;
    if (quantidadeTotal > estoqueDisponivel) {
      throw new EstoqueInsuficienteError();
    }
    const novoItem: ItemCarrinho = {
      produtoId: produto.id,
      nome: produto.name,
      marca: produto.brand,
      modelo: produto.model,
      imagemUrl: produto.imageUrl,
      preco: produto.price,
      quantidade: quantidadeTotal,
    };
    const novosItens = itemExistente
      ? itens.map((item) =>
          item.produtoId === produtoId ? novoItem : item,
        )
      : [...itens, novoItem];
    const carrinho: Carrinho = {
      usuarioId,
      itens: novosItens,
    };
    await this.carrinhoRepository.salvar(carrinho);
    return carrinho;
  }
}
