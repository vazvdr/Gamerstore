
import { api } from '@/data/api/api';
import { productsService } from '@/data/services/produtos.service';
import type { ItemCarrinho } from '@/data/contexts/CarrinhoContext';

interface ItemCarrinhoResponse {
  produtoId: string;
  nome: string;
  marca: string;
  modelo: string;
  imagemUrl: string | null;
  preco: string | number;
  quantidade: number;
}

interface CarrinhoResponse {
  usuarioId: string;
  itens: ItemCarrinhoResponse[];
}

export const carrinhoService = {
  async normalizar(
    carrinho: CarrinhoResponse,
    itensAtuais: ItemCarrinho[] = [],
  ): Promise<ItemCarrinho[]> {
    return Promise.all(
      carrinho.itens.map(async (item) => {
        const existente = itensAtuais.find(
          (atual) => atual.produtoId === item.produtoId,
        );

        const produto = existente
          ? null
          : await productsService.getById(item.produtoId);

        const preco = Number(item.preco);

        return {
          produtoId: item.produtoId,
          nome: item.nome,
          descricao: existente?.descricao ?? produto?.description ?? '',
          imagemUrl:
            item.imagemUrl ??
            existente?.imagemUrl ??
            produto?.imageUrl ??
            '',
          preco: Number.isFinite(preco)
            ? preco
            : existente?.preco ?? produto?.price ?? 0,
          estoque: existente?.estoque ??
            Math.max(
              0,
              (produto?.stock ?? 0) - (produto?.reservedStock ?? 0),
            ),
          quantidade: item.quantidade,
        };
      }),
    );
  },

  async consultar(
    itensAtuais: ItemCarrinho[] = [],
  ): Promise<ItemCarrinho[]> {
    const { data } = await api.get<CarrinhoResponse>('/carrinho');
    return this.normalizar(data, itensAtuais);
  },

  async sincronizar(
    itens: { produtoId: string; quantidade: number }[],
  ): Promise<CarrinhoResponse> {
    const { data } = await api.post<CarrinhoResponse>(
      '/carrinho/sincronizar',
      { itens },
    );

    return data;
  },

  async adicionar(
    produtoId: string,
    quantidade: number,
    itensAtuais: ItemCarrinho[],
  ): Promise<ItemCarrinho[]> {
    const { data } = await api.post<CarrinhoResponse>(
      '/carrinho/itens',
      { produtoId, quantidade },
    );

    return this.normalizar(data, itensAtuais);
  },

  async aumentar(
    produtoId: string,
    itensAtuais: ItemCarrinho[],
  ): Promise<ItemCarrinho[]> {
    const { data } = await api.patch<CarrinhoResponse>(
      `/carrinho/itens/${encodeURIComponent(produtoId)}/aumentar`,
      {},
    );

    return this.normalizar(data, itensAtuais);
  },

  async diminuir(
    produtoId: string,
    itensAtuais: ItemCarrinho[],
  ): Promise<ItemCarrinho[]> {
    const { data } = await api.patch<CarrinhoResponse>(
      `/carrinho/itens/${encodeURIComponent(produtoId)}/diminuir`,
      {},
    );

    return this.normalizar(data, itensAtuais);
  },

  async remover(
    produtoId: string,
    itensAtuais: ItemCarrinho[],
  ): Promise<ItemCarrinho[]> {
    const { data } = await api.delete<CarrinhoResponse>(
      `/carrinho/itens/${encodeURIComponent(produtoId)}`,
    );

    return this.normalizar(data, itensAtuais);
  },
  async limpar(): Promise<void> {
    await api.delete('/carrinho');
  },
};
