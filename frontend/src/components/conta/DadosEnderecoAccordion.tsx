'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const inputClassName = 'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-400 focus:ring-1 focus:ring-lime-400';

export default function AddressDataAccordion() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
      <Accordion>
        <AccordionItem value="address-data" className="border-0">
          <AccordionTrigger className="items-center py-2 hover:no-underline">
            <div>
              <h2 className="text-base font-semibold text-white">Dados de Endereço</h2>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Atualize seus dados de endereço.
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="address-street" className="text-sm font-medium text-zinc-300">Rua</label>
                <input id="address-street" name="rua" type="text" autoComplete="address-line1" placeholder="Nome da rua" className={inputClassName} />
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <label htmlFor="address-number" className="text-sm font-medium text-zinc-300">Número</label>
                  <input id="address-number" name="numero" type="text" inputMode="numeric" placeholder="Nº" className={inputClassName} />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <label htmlFor="address-neighborhood" className="text-sm font-medium text-zinc-300">Bairro</label>
                  <input id="address-neighborhood" name="bairro" type="text" autoComplete="address-level3" placeholder="Seu bairro" className={inputClassName} />
                </div>
              </div>
              <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <label htmlFor="address-city" className="text-sm font-medium text-zinc-300">Cidade</label>
                  <input id="address-city" name="cidade" type="text" autoComplete="address-level2" placeholder="Sua cidade" className={inputClassName} />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <label htmlFor="address-state" className="text-sm font-medium text-zinc-300">Estado</label>
                  <input id="address-state" name="estado" type="text" autoComplete="address-level1" maxLength={2} placeholder="Ex.: RJ" className={inputClassName} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="address-cep" className="text-sm font-medium text-zinc-300">CEP</label>
                <input id="address-cep" name="cep" type="text" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" className={inputClassName} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="address-complement" className="text-sm font-medium text-zinc-300">Complemento</label>
                <input id="address-complement" name="complemento" type="text" autoComplete="address-line2" placeholder="Apartamento, bloco etc." className={inputClassName} />
              </div>
              <label htmlFor="address-primary" className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                <input id="address-primary" name="principal" type="checkbox" className="size-4 cursor-pointer accent-lime-400" />
                Endereço principal
              </label>
              <button type="submit" className="mt-1 w-full cursor-pointer rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-lime-300">
                Salvar endereço
              </button>
            </form>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
