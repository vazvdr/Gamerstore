
interface ResumoCarrinhoProps {
  quantidadeTotal: number;
  valorTotal: number;
  finalizando: boolean;
  desabilitado: boolean;
  onFinalizar: () => void;
}

export default function ResumoCarrinho({
  quantidadeTotal,
  valorTotal,
  finalizando,
  desabilitado,
  onFinalizar,
}: ResumoCarrinhoProps) {
  return (
    <aside className="h-fit rounded-2xl border border-lime-500 p-5">
      <h2 className="mb-6 text-xl font-bold">Resumo do carrinho</h2>

      <div className="mb-4 flex items-center justify-between gap-3 text-sm">
        <span className="text-zinc-300">Quantidade de produtos</span>
        <span className="font-semibold">{quantidadeTotal}</span>
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
        disabled={desabilitado || finalizando}
        onClick={onFinalizar}
        className="w-full cursor-pointer rounded-lg border border-white bg-lime-400 px-3 py-3 font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        {finalizando ? 'Enviando...' : 'Finalizar compra'}
      </button>
    </aside>
  );
}
