'use client';
import { useState } from 'react';
import { Truck } from 'lucide-react';
import type { CalcularFreteResponse } from '@/data/types/frete/frete.types';

interface Endereco {
  localidade: string;
  uf: string;
}

interface CalcularFreteProps {
  cep: string;
  frete: CalcularFreteResponse | null;
  carregando: boolean;
  erro: string;
  onCepChange: (cep: string) => void;
  calcularFrete: (cepDestino: string) => Promise<CalcularFreteResponse | null>;
  limparFrete: () => void;
}

export default function CalcularFrete({
  cep,
  frete,
  carregando: calculandoFrete,
  erro: erroFrete,
  onCepChange,
  calcularFrete,
  limparFrete,
}: CalcularFreteProps) {
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [consultandoCep, setConsultandoCep] = useState(false);
  const [erroCep, setErroCep] = useState('');

  const carregando = consultandoCep || calculandoFrete;

  function handleCepChange(value: string) {
    const cepNumerico = value.replace(/\D/g, '').slice(0, 8);
    onCepChange(cepNumerico.replace(/^(\d{5})(\d)/, '$1-$2'));
    setEndereco(null);
    setErroCep('');
    limparFrete();
  }

  async function consultarCep() {
    const cepNumerico = cep.replace(/\D/g, '');
    if (cepNumerico.length !== 8) {
      setErroCep('Informe um CEP válido.');
      return;
    }
    setConsultandoCep(true);
    setErroCep('');
    setEndereco(null);
    limparFrete();
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepNumerico}/json/`,
      );
      if (!response.ok) {
        throw new Error('Não foi possível consultar o CEP.');
      }
      const data = await response.json();
      if (data.erro) {
        throw new Error('CEP não encontrado.');
      }
      setEndereco({
        localidade: data.localidade,
        uf: data.uf,
      });
      await calcularFrete(cepNumerico);
    } catch (error) {
      setErroCep(
        error instanceof Error
          ? error.message
          : 'Erro ao consultar o CEP.',
      );
    } finally {
      setConsultandoCep(false);
    }
  }
  return (
    <section className="rounded-2xl border border-lime-500 p-5">
      <div className="mb-5 flex items-center gap-3">
        <Truck size={23} className="text-lime-400" />
        <h2 className="text-lg font-bold">Calcular frete</h2>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void consultarCep();
        }}
        className="flex flex-col gap-3"
      >
        <label
          htmlFor="cep"
          className="text-sm font-medium text-zinc-300"
        >
          Informe seu CEP
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="cep"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            value={cep}
            onChange={(event) => handleCepChange(event.target.value)}
            maxLength={9}
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-[#18181b] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-400"
          />

          <button
            type="submit"
            disabled={carregando}
            className="cursor-pointer rounded-lg bg-lime-400 px-6 py-3 font-bold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? 'Consultando...' : 'Calcular frete'}
          </button>
        </div>

        {erroCep && (
          <p role="alert" className="text-sm text-red-400">
            {erroCep}
          </p>
        )}

        {erroFrete && (
          <p role="alert" className="text-sm text-red-400">
            {erroFrete}
          </p>
        )}

        {endereco && (
          <div className="rounded-lg border border-zinc-700 bg-[#18181b] p-4">
            <p className="text-sm text-zinc-400">
              Endereço de entrega
            </p>
            <p className="mt-1 font-semibold text-white">
              {endereco.localidade} - {endereco.uf}
            </p>
          </div>
        )}

        {frete && (
          <div className="rounded-lg border border-lime-500/40 bg-[#18181b] p-4">
            <p className="text-sm text-zinc-400">
              Valor do frete
            </p>
            <p className="mt-1 text-2xl font-extrabold text-lime-400">
              {frete.valorFrete.toLocaleString('pt-BR', {
                style: 'currency',
                currency: frete.moeda,
              })}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Entrega para {frete.cepDestino} - {frete.estadoDestino}
            </p>
          </div>
        )}
      </form>
    </section>
  );
}
