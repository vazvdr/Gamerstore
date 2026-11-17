export interface ItemCarrinho {
  produtoId: string;
  nome: string;
  marca: string;
  modelo: string;
  imagemUrl: string | null;
  preco: string;
  quantidade: number;
}