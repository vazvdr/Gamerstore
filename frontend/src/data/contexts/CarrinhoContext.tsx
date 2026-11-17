
'use client';

import { createContext, useEffect, useState, type ReactNode } from 'react';
import { createStore } from 'zustand/vanilla';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/data/services/produtos.service';
import { carrinhoService } from '@/data/services/carrinho.service';

export interface ItemCarrinho {
  produtoId: Product['id'];
  nome: string;
  descricao: string;
  imagemUrl: string;
  preco: number;
  estoque: number;
  quantidade: number;
}

export interface CarrinhoState {
  itens: ItemCarrinho[];
  hidratado: boolean;
  autenticado: boolean;
  sincronizacaoConcluida: boolean;
  definirItens: (itens: ItemCarrinho[]) => void;
  definirAutenticado: (autenticado: boolean) => void;
  sincronizarCarrinho: () => Promise<void>;
  consultarCarrinho: () => Promise<void>;
  adicionarProduto: (
    produto: Pick<Product, 'id' | 'name' | 'description' | 'imageUrl' | 'price' | 'stock'>,
  ) => Promise<void>;
  aumentarQuantidade: (produtoId: Product['id']) => Promise<void>;
  diminuirQuantidade: (produtoId: Product['id']) => Promise<void>;
  removerProduto: (produtoId: Product['id']) => Promise<void>;
  limparCarrinho: () => Promise<void>;
}

type CarrinhoStore = ReturnType<typeof createCarrinhoStore>;

function createCarrinhoStore() {
  let autenticado = false;

  return createStore<CarrinhoState>()(
    persist(
      (set, get) => ({
        itens: [],
        hidratado: false,
        autenticado: false,
        sincronizacaoConcluida: false,

        definirItens: (itens) => set({ itens }),

        definirAutenticado: (valor) => {
          autenticado = valor;

          if (valor) {
            set({
              autenticado: true,
              sincronizacaoConcluida: false,
            });
            return;
          }

          const { itens, sincronizacaoConcluida } = get();

          set({
            autenticado: false,
            itens: sincronizacaoConcluida ? [] : itens,
            sincronizacaoConcluida: false,
          });
        },

        sincronizarCarrinho: async () => {
          const itensLocais = get().itens;

          const resposta = await carrinhoService.sincronizar(
            itensLocais.map(({ produtoId, quantidade }) => ({
              produtoId,
              quantidade,
            })),
          );

          // Só remove o carrinho local depois da confirmação do backend.
          localStorage.removeItem('gamerstore-carrinho');

          const itens = await carrinhoService.normalizar(
            resposta,
            itensLocais,
          );

          set({
            itens,
            sincronizacaoConcluida: true,
          });
        },

        consultarCarrinho: async () => {
          const itens = await carrinhoService.consultar(get().itens);
          set({ itens });
        },

        adicionarProduto: async (produto) => {
          if (get().autenticado) {
            const item: ItemCarrinho = {
              produtoId: produto.id,
              nome: produto.name,
              descricao: produto.description,
              imagemUrl: produto.imageUrl,
              preco: produto.price,
              estoque: Math.max(0, produto.stock),
              quantidade: 1,
            };

            const itens = await carrinhoService.adicionar(
              produto.id,
              1,
              [...get().itens, item],
            );

            set({ itens });
            return;
          }

          set((state) => {
            if (produto.stock <= 0) return state;

            const itemExistente = state.itens.find(
              (item) => item.produtoId === produto.id,
            );

            if (itemExistente) {
              return {
                itens: state.itens.map((item) =>
                  item.produtoId === produto.id
                    ? {
                        ...item,
                        quantidade: Math.min(
                          item.quantidade + 1,
                          produto.stock,
                        ),
                      }
                    : item,
                ),
              };
            }

            return {
              itens: [
                ...state.itens,
                {
                  produtoId: produto.id,
                  nome: produto.name,
                  descricao: produto.description,
                  imagemUrl: produto.imageUrl,
                  preco: produto.price,
                  estoque: produto.stock,
                  quantidade: 1,
                },
              ],
            };
          });
        },

        aumentarQuantidade: async (produtoId) => {
          if (get().autenticado) {
            const itens = await carrinhoService.aumentar(
              produtoId,
              get().itens,
            );

            set({ itens });
            return;
          }

          set((state) => ({
            itens: state.itens.map((item) =>
              item.produtoId === produtoId
                ? {
                    ...item,
                    quantidade: Math.min(
                      item.quantidade + 1,
                      item.estoque,
                    ),
                  }
                : item,
            ),
          }));
        },

        diminuirQuantidade: async (produtoId) => {
          if (get().autenticado) {
            const itens = await carrinhoService.diminuir(
              produtoId,
              get().itens,
            );

            set({ itens });
            return;
          }

          set((state) => ({
            itens: state.itens.map((item) =>
              item.produtoId === produtoId
                ? {
                    ...item,
                    quantidade: Math.max(item.quantidade - 1, 1),
                  }
                : item,
            ),
          }));
        },

        removerProduto: async (produtoId) => {
          if (get().autenticado) {
            const itens = await carrinhoService.remover(
              produtoId,
              get().itens,
            );

            set({ itens });
            return;
          }

          set((state) => ({
            itens: state.itens.filter(
              (item) => item.produtoId !== produtoId,
            ),
          }));
        },

        limparCarrinho: async () => {
          if (get().autenticado) {
            await carrinhoService.limpar();
          }

          set({ itens: [] });
        },
      }),
      {
        name: 'gamerstore-carrinho',
        storage: createJSONStorage(() => ({
          getItem: (name) => localStorage.getItem(name),
          setItem: (name, value) => {
            if (!autenticado) {
              localStorage.setItem(name, value);
            }
          },
          removeItem: (name) => localStorage.removeItem(name),
        })),
        skipHydration: true,
        partialize: (state) => ({ itens: state.itens }),
      },
    ),
  );
}

export const CarrinhoContext = createContext<CarrinhoStore | null>(null);

interface CarrinhoProviderProps {
  children: ReactNode;
}

export function CarrinhoProvider({ children }: CarrinhoProviderProps) {
  const [carrinhoStore] = useState(() => createCarrinhoStore());

  useEffect(() => {
    void Promise.resolve(carrinhoStore.persist.rehydrate())
      .catch(() => undefined)
      .finally(() => {
        carrinhoStore.setState({ hidratado: true });
      });
  }, [carrinhoStore]);

  return (
    <CarrinhoContext.Provider value={carrinhoStore}>
      {children}
    </CarrinhoContext.Provider>
  );
}