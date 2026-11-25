
'use client';

import { useState } from 'react';
import { useCarrinho } from '@/data/hooks/useCarrinho';
import { useFrete } from '@/data/hooks/useFrete';
import { checkoutService } from '@/data/services/checkout.service';
import ListaProdutosCarrinho from './ListaProdutosCarrinho';
import ResumoCarrinho from './ResumoCarrinho';
import CalcularFrete from './CalcularFrete';
import CarrinhoVazio from './CarrinhoVazio';

export default function ConteudoCarrinho() {
  const itens = useCarrinho((state) => state.itens);

  const [cep, setCep] = useState('');
  const [finalizando, setFinalizando] = useState(false);
  const [erroCheckout, setErroCheckout] = useState('');
  const [mensagemCheckout, setMensagemCheckout] = useState('');

  const {
    frete,
    carregando,
    erro,
    calcularFrete,
    limparFrete,
  } = useFrete();

  const quantidadeTotal = itens.reduce(
    (total, item) => total + item.quantidade,
    0,
  );

  const valorTotal = itens.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0,
  );

  async function finalizarCompra() {
    if (itens.length === 0 || !frete || finalizando) {
      return;
    }

    const cepDestino = cep.replace(/\D/g, '');

    if (cepDestino.length !== 8) {
      setErroCheckout('Informe um CEP válido e calcule o frete.');
      return;
    }

    setFinalizando(true);
    setErroCheckout('');
    setMensagemCheckout('');

    try {
      const resposta = await checkoutService.validar({
        itens: itens.map((item) => ({
          produtoId: String(item.produtoId),
          quantidade: item.quantidade,
        })),
        frete: {
          tipo: 'PADRAO',
          cepDestino,
        },
      });

      setMensagemCheckout(resposta.mensagem);
    } catch (error) {
      setErroCheckout(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar os dados do checkout.',
      );
    } finally {
      setFinalizando(false);
    }
  }

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
                finalizando={finalizando}
                desabilitado={!frete || cep.replace(/\D/g, '').length !== 8}
                onFinalizar={() => void finalizarCompra()}
              />

              {erroCheckout && (
                <p role="alert" className="text-sm text-red-400">
                  {erroCheckout}
                </p>
              )}

              {mensagemCheckout && (
                <p role="status" className="text-sm text-lime-400">
                  {mensagemCheckout}
                </p>
              )}

              <CalcularFrete
                cep={cep}
                frete={frete}
                carregando={carregando}
                erro={erro}
                onCepChange={setCep}
                calcularFrete={calcularFrete}
                limparFrete={limparFrete}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
