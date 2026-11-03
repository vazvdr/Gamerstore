'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEndereco } from '@/data/hooks/useEndereco';

type EnderecoState = ReturnType<typeof useEndereco>;

interface DadosEnderecoAccordionProps {
  enderecoState: EnderecoState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const inputClassName = 'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-400 focus:ring-1 focus:ring-lime-400';

export default function DadosEnderecoAccordion({ enderecoState, open, onOpenChange }: DadosEnderecoAccordionProps) {
  const {
    endereco, setEndereco, enderecoEmEdicao, loading, erro, sucesso,
    salvarEndereco, cancelarEdicaoEndereco,
  } = enderecoState;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
      <Accordion
        value={open ? ['address-data'] : []}
        onValueChange={(value) => onOpenChange(value.includes('address-data'))}>
        <AccordionItem value="address-data" className="border-0">
          <AccordionTrigger className="items-center py-2 hover:no-underline">
            <div>
              <h2 className="text-base font-semibold text-white">Dados de Endereço</h2>
              <p className="mt-1 text-xs leading-5 text-zinc-400">Cadastre ou atualize seus endereços.</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <form onSubmit={salvarEndereco} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="address-street" className="text-sm font-medium text-zinc-300">Rua</label>
                <input id="address-street" name="rua" type="text" autoComplete="address-line1" placeholder="Nome da rua" required value={endereco.rua} onChange={(event) => setEndereco({ ...endereco, rua: event.target.value })} className={inputClassName} />
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <label htmlFor="address-number" className="text-sm font-medium text-zinc-300">Número</label>
                  <input id="address-number" name="numero" type="text" inputMode="numeric" placeholder="Nº" required value={endereco.numero} onChange={(event) => setEndereco({ ...endereco, numero: event.target.value })} className={inputClassName} />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <label htmlFor="address-neighborhood" className="text-sm font-medium text-zinc-300">Bairro</label>
                  <input id="address-neighborhood" name="bairro" type="text" autoComplete="address-level3" placeholder="Seu bairro" required value={endereco.bairro} onChange={(event) => setEndereco({ ...endereco, bairro: event.target.value })} className={inputClassName} />
                </div>
              </div>

              <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <label htmlFor="address-city" className="text-sm font-medium text-zinc-300">Cidade</label>
                  <input id="address-city" name="cidade" type="text" autoComplete="address-level2" placeholder="Sua cidade" required value={endereco.cidade} onChange={(event) => setEndereco({ ...endereco, cidade: event.target.value })} className={inputClassName} />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <label htmlFor="address-state" className="text-sm font-medium text-zinc-300">Estado</label>
                  <input id="address-state" name="estado" type="text" autoComplete="address-level1" maxLength={2} placeholder="Ex.: RJ" required value={endereco.estado} onChange={(event) => setEndereco({ ...endereco, estado: event.target.value.toUpperCase() })} className={inputClassName} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="address-cep" className="text-sm font-medium text-zinc-300">CEP</label>
                <input id="address-cep" name="cep" type="text" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" required value={endereco.cep} onChange={(event) => setEndereco({ ...endereco, cep: event.target.value })} className={inputClassName} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="address-complement" className="text-sm font-medium text-zinc-300">Complemento</label>
                <input id="address-complement" name="complemento" type="text" autoComplete="address-line2" placeholder="Apartamento, bloco etc." value={endereco.complemento ?? ''} onChange={(event) => setEndereco({ ...endereco, complemento: event.target.value })} className={inputClassName} />
              </div>

              <label htmlFor="address-primary" className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input id="address-primary" name="principal" type="checkbox" checked={endereco.principal} onChange={(event) => setEndereco({ ...endereco, principal: event.target.checked })} className="size-4 cursor-pointer accent-lime-400" />
                Endereço principal
              </label>

              {erro && <p className="text-sm text-red-400">{erro}</p>}
              {sucesso && <p className="text-sm text-lime-400">{sucesso}</p>}

              <button type="submit" disabled={loading} className="mt-1 w-full cursor-pointer rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? 'Salvando...' : enderecoEmEdicao ? 'Atualizar endereço' : 'Salvar endereço'}
              </button>

              {enderecoEmEdicao && (
                <button type="button" onClick={cancelarEdicaoEndereco} className="text-sm text-zinc-400 transition hover:text-white">
                  Cancelar edição
                </button>
              )}
            </form>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
