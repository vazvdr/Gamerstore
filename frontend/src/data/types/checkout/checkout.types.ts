
export interface ItemCheckout {
  produtoId: string;
  quantidade: number;
}

export interface FreteCheckout {
  tipo: 'PADRAO';
  cepDestino: string;
}

export interface ValidarCheckoutData {
  itens: ItemCheckout[];
  frete: FreteCheckout;
}

export interface ValidarCheckoutResponse {
  sucesso: boolean;
  mensagem: string;
}
