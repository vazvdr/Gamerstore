
import { Inject, Injectable } from '@nestjs/common';
import {
  CarrinhoRepositoryPort,
  CARRINHO_REPOSITORY,
} from '../../ports/saida/carrinho-repository.ports';
import type { Carrinho } from '../../../domain/entities/carrinho';

@Injectable()
export class ConsultarCarrinhoUseCase {
  constructor(
    @Inject(CARRINHO_REPOSITORY)
    private readonly carrinhoRepository: CarrinhoRepositoryPort,
  ) {}

  async execute(usuarioId: string): Promise<Carrinho> {
    const carrinho =
      await this.carrinhoRepository.buscarPorUsuarioId(usuarioId);

    return (
      carrinho ?? {
        usuarioId,
        itens: [],
      }
    );
  }
}
