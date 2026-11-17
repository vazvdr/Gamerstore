
import { Inject, Injectable } from '@nestjs/common';
import {
  CarrinhoRepositoryPort,
  CARRINHO_REPOSITORY,
} from '../../ports/saida/carrinho-repository.ports';

@Injectable()
export class LimparCarrinhoUseCase {
  constructor(
    @Inject(CARRINHO_REPOSITORY)
    private readonly carrinhoRepository: CarrinhoRepositoryPort,
  ) {}

  async execute(usuarioId: string): Promise<void> {
    await this.carrinhoRepository.limpar(usuarioId);
  }
}
