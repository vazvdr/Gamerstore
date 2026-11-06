import type { Produto } from '../../../domain/entities/produto';

export interface ProdutoRepositorioPorta {
  listarProdutos(): Promise<Produto[]>;
  listarPorId(id: string): Promise<Produto | null>;
}

export const PRODUTO_REPOSITORIO = Symbol('PRODUTO_REPOSITORIO');