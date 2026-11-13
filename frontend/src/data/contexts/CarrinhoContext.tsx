'use client';

import { createContext, useEffect, useState, type ReactNode } from 'react';
import { createStore } from 'zustand/vanilla';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/data/services/produtos.service';

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
  adicionarProduto: (
    produto: Pick<
      Product,
      'id' | 'name' | 'description' | 'imageUrl' | 'price' | 'stock'
    >,
  ) => void;
  aumentarQuantidade: (produtoId: Product['id']) => void;
  diminuirQuantidade: (produtoId: Product['id']) => void;
  removerProduto: (produtoId: Product['id']) => void;
}

type CarrinhoStore = ReturnType<typeof createCarrinhoStore>;

function createCarrinhoStore() {
  return createStore<CarrinhoState>()(
    persist(
      (set) => ({
        itens: [],

        adicionarProduto: (produto) =>
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
          }),

        aumentarQuantidade: (produtoId) =>
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
          })),

        diminuirQuantidade: (produtoId) =>
          set((state) => ({
            itens: state.itens.map((item) =>
              item.produtoId === produtoId
                ? {
                    ...item,
                    quantidade: Math.max(item.quantidade - 1, 1),
                  }
                : item,
            ),
          })),

        removerProduto: (produtoId) =>
          set((state) => ({
            itens: state.itens.filter(
              (item) => item.produtoId !== produtoId,
            ),
          })),
      }),
      {
        name: 'gamerstore-carrinho',
        storage: createJSONStorage(() => localStorage),
        skipHydration: true,
        partialize: (state) => ({
          itens: state.itens,
        }),
      },
    ),
  );
}

export const CarrinhoContext = createContext<CarrinhoStore | null>(null);

interface CarrinhoProviderProps {
  children: ReactNode;
}

export function CarrinhoProvider({ children }: CarrinhoProviderProps) {
  const [store] = useState(() => createCarrinhoStore());

  useEffect(() => {
    void store.persist.rehydrate();
  }, [store]);

  return (
    <CarrinhoContext.Provider value={store}>
      {children}
    </CarrinhoContext.Provider>
  );
}