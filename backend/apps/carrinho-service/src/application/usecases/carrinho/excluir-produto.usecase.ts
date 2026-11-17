import { Inject, Injectable } from '@nestjs/common';
import {
  CarrinhoRepositoryPort,
  CARRINHO_REPOSITORY,
} from '../../ports/saida/carrinho-repository.ports';
import type { Carrinho } from '../../../domain/entities/carrinho';
import { ProdutoNaoEncontradoNoCarrinhoError } from './aumentar-quantidade-produto.usecase';

@Injectable()
export class ExcluirProdutoUseCase {
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
    const produtoExiste = carrinho.itens.some(
      (item) => item.produtoId === produtoId,
    );
    if (!produtoExiste) {
      throw new ProdutoNaoEncontradoNoCarrinhoError();
    }
    const carrinhoAtualizado: Carrinho = {
      ...carrinho,
      itens: carrinho.itens.filter(
        (item) => item.produtoId !== produtoId,
      ),
    };
    await this.carrinhoRepository.salvar(carrinhoAtualizado);
    return carrinhoAtualizado;
  }
}
