import type { Carrinho } from '../../../domain/entities/carrinho';

export interface CarrinhoRepositoryPort {
  buscarPorUsuarioId(usuarioId: string): Promise<Carrinho>;
  salvar(carrinho: Carrinho): Promise<void>;
  limpar(usuarioId: string): Promise<void>;
}

export const CARRINHO_REPOSITORY = Symbol('CARRINHO_REPOSITORY');