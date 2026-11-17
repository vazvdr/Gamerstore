import { Inject, Injectable } from '@nestjs/common';
import {
  CarrinhoRepositoryPort,
  CARRINHO_REPOSITORY,
} from '../../ports/saida/carrinho-repository.ports';
import type { Carrinho } from '../../../domain/entities/carrinho';
import { ProdutoNaoEncontradoNoCarrinhoError } from './aumentar-quantidade-produto.usecase';

@Injectable()
export class DiminuirQuantidadeProdutoUseCase {
  constructor(
    @Inject(CARRINHO_REPOSITORY)
    private readonly carrinhoRepository: CarrinhoRepositoryPort,
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
    if (item.quantidade <= 1) {
      return carrinho;
    }
    const novosItens = carrinho.itens.map((itemCarrinho) =>
      itemCarrinho.produtoId === produtoId
        ? {
            ...itemCarrinho,
            quantidade: itemCarrinho.quantidade - 1,
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
