interface ResumoCarrinhoProps {
  quantidadeTotal: number;
  valorTotal: number;
}

export default function ResumoCarrinho({
  quantidadeTotal,
  valorTotal,
}: ResumoCarrinhoProps) {
  return (
    <aside className="h-fit rounded-2xl border border-lime-500 p-5">
      <h2 className="mb-6 text-xl font-bold">Resumo do carrinho</h2>
      <div className="mb-4 flex items-center justify-between gap-3 text-sm">
        <span className="text-zinc-300">Quantidade de produtos</span>
        <span className="font-semibold">
          {quantidadeTotal}
        </span>
      </div>
      <div className="mb-5 flex items-center justify-between gap-3 border-t border-zinc-800 pt-5">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-extrabold text-lime-400">
          {valorTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </span>
      </div>
      <button
        type="button"
        disabled
        className="w-full cursor-pointer rounded-lg bg-zinc-800 hover:bg-lime-500 hover:text-black px-3 py-3 font-semibold text-zinc-400">
        Finalizar compra
      </button>
    </aside>
  );
}