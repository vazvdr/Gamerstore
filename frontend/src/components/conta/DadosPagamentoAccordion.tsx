'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const inputClassName = 'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-400 focus:ring-1 focus:ring-lime-400';

export default function PaymentDataAccordion() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
      <Accordion>
        <AccordionItem value="payment-data" className="border-0">
          <AccordionTrigger className="items-center py-2 hover:no-underline">
            <div>
              <h2 className="text-base font-semibold text-white">Dados de Pagamento</h2>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Cadastre seus cartões de crédito.
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="card-number" className="text-sm font-medium text-zinc-300">Número do cartão</label>
                <input id="card-number" name="numeroCartao" type="text" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" className={inputClassName} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="card-expiry" className="text-sm font-medium text-zinc-300">Validade</label>
                <input id="card-expiry" name="validade" type="text" autoComplete="cc-exp" placeholder="MM/AA" className={inputClassName} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="card-cvc" className="text-sm font-medium text-zinc-300">Código de segurança</label>
                <input id="card-cvc" name="codigoSeguranca" type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="CVV" className={inputClassName} />
              </div>
              <button type="submit" className="mt-1 w-full cursor-pointer rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-lime-300">
                Salvar cartão
              </button>
            </form>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
