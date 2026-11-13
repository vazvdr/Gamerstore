import { useContext } from 'react';
import { useStore } from 'zustand';
import {
  CarrinhoContext,
  type CarrinhoState,
} from '@/data/contexts/CarrinhoContext';

export function useCarrinho<T>(
  selector: (state: CarrinhoState) => T,
): T {
  const store = useContext(CarrinhoContext);

  if (!store) {
    throw new Error(
      'useCarrinho deve ser utilizado dentro de CarrinhoProvider.',
    );
  }

  return useStore(store, selector);
}