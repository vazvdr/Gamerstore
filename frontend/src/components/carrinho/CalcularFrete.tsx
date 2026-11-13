'use client';
import { useState } from 'react';
import { Truck } from 'lucide-react';

interface Endereco {
  localidade: string;
  uf: string;
}

export default function CalcularFrete() {
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  function handleCepChange(value: string) {
    const cepNumerico = value.replace(/\D/g, '').slice(0, 8);

    setCep(
      cepNumerico.replace(/^(\d{5})(\d)/, '$1-$2'),
    );

    setEndereco(null);
    setErro('');
  }

  async function consultarCep() {
    const cepNumerico = cep.replace(/\D/g, '');

    if (cepNumerico.length !== 8) {
      setErro('Informe um CEP válido.');
      return;
    }

    setCarregando(true);
    setErro('');
    setEndereco(null);

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
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Erro ao consultar o CEP.',
      );
    } finally {
      setCarregando(false);
    }
  }
  return (
    <section className="rounded-2xl border border-lime-500 p-5">
      <div className="mb-5 flex items-center gap-3">
        <Truck size={23} className="text-lime-400" />
        <h2 className="text-lg font-bold">
          Calcular frete
        </h2>
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
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-[#18181b] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-400"/>
          <button
            type="submit"
            disabled={carregando}
            className="cursor-pointer rounded-lg bg-lime-400 px-6 py-3 font-bold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50">
            {carregando ? 'Consultando...' : 'Consultar CEP'}
          </button>
        </div>
        {erro && (
          <p role="alert" className="text-sm text-red-400">
            {erro}
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
      </form>
    </section>
  );
}