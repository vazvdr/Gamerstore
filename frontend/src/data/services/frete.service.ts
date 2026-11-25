import { api } from '@/data/api/api';
import type {
  CalcularFreteData,
  CalcularFreteResponse,
} from '@/data/types/frete/frete.types';

export const freteService = {
  async calcular(dados: CalcularFreteData): Promise<CalcularFreteResponse> {
    const { data } = await api.post<CalcularFreteResponse>(
      '/fretes/calcular',
      dados,
    );

    return data;
  },
};
