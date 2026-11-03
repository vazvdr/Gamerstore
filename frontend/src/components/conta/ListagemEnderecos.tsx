'use client';
import { useState } from 'react';
import { useEndereco } from '@/data/hooks/useEndereco';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
type EnderecoState = ReturnType<typeof useEndereco>;
interface ListagemEnderecosProps {
  enderecoState: EnderecoState;
  onEditar: () => void;
}

export default function ListagemEnderecos({ enderecoState, onEditar }: ListagemEnderecosProps) {
  const { enderecos, loading, selecionarEndereco, deletarEndereco } = enderecoState;
  const [enderecoParaExcluir, setEnderecoParaExcluir] = useState<string | null>(null);
  async function confirmarExclusao() {
    if (!enderecoParaExcluir) return;
    const sucesso = await deletarEndereco(enderecoParaExcluir);
    if (sucesso) setEnderecoParaExcluir(null);
  }
  return (
    <>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">Meus endereços</h2>
          <p className="mt-1 text-xs leading-5 text-zinc-400">Gerencie seus endereços cadastrados.</p>
        </div>
        {enderecos.length > 0 ? (
          <div className="flex flex-col gap-3">
            {enderecos.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{item.rua}, {item.numero} — {item.bairro}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {item.cidade}/{item.estado} · {item.cep}
                    {item.principal && <span className="ml-2 text-lime-400">Principal</span>}
                  </p>
                  {item.complemento && <p className="mt-1 text-xs text-zinc-500">{item.complemento}</p>}
                </div>
                <div className="flex gap-3 text-xs">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      selecionarEndereco(item);
                      onEditar();
                    }}
                    className="cursor-pointer text-lime-400 transition hover:text-lime-300 disabled:opacity-50">
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setEnderecoParaExcluir(item.id)}
                    className="cursor-pointer text-red-400 transition hover:text-red-300 disabled:opacity-50">
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-5 text-center text-sm text-zinc-500">Você ainda não possui endereços cadastrados.</p>
        )}
      </section>
      <AlertDialog open={!!enderecoParaExcluir} onOpenChange={(open) => !open && setEnderecoParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir endereço?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação excluirá permanentemente este endereço da sua conta. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading} className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={confirmarExclusao}
              className="bg-red-500 text-white hover:bg-red-600 cursor-pointer">
              {loading ? 'Excluindo...' : 'Excluir endereço'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}