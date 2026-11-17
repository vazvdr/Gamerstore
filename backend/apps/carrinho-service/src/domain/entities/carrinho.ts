import type { ItemCarrinho } from './item-carrinho';

export interface Carrinho {
  usuarioId: string;
  itens: ItemCarrinho[];
}