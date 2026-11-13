'use client';
import { useCarrinho } from '@/data/hooks/useCarrinho';
import ListaProdutosCarrinho from './ListaProdutosCarrinho';
import ResumoCarrinho from './ResumoCarrinho';
import CalcularFrete from './CalcularFrete';
import CarrinhoVazio from './CarrinhoVazio';

export default function ConteudoCarrinho() {
  const itens = useCarrinho((state) => state.itens);

  const quantidadeTotal = itens.reduce(
    (total, item) => total + item.quantidade,
    0,
  );

  const valorTotal = itens.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0,
  );

  return (
    <main className="min-h-screen bg-black px-4 pb-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto mt-34 max-w-7xl">
        <h1 className="mb-9 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 bg-clip-text text-center text-3xl font-extrabold text-transparent sm:text-4xl">
          Meu carrinho
        </h1>

        {itens.length === 0 ? (
          <CarrinhoVazio />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <ListaProdutosCarrinho itens={itens} />

            <div className="flex flex-col gap-5">
              <ResumoCarrinho
                quantidadeTotal={quantidadeTotal}
                valorTotal={valorTotal}
              />

              <CalcularFrete />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}