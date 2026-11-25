import { useState } from 'react';
import { freteService } from '@/data/services/frete.service';
import type { CalcularFreteResponse } from '@/data/types/frete/frete.types';

export function useFrete() {
  const [frete, setFrete] = useState<CalcularFreteResponse | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function calcularFrete(cepDestino: string) {
    setCarregando(true);
    setErro('');
    setFrete(null);

    try {
      const resultado = await freteService.calcular({ cepDestino });
      setFrete(resultado);
      return resultado;
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível calcular o frete.',
      );
      return null;
    } finally {
      setCarregando(false);
    }
  }

  function limparFrete() {
    setFrete(null);
    setErro('');
  }

  return {
    frete,
    carregando,
    erro,
    calcularFrete,
    limparFrete,
  };
}
