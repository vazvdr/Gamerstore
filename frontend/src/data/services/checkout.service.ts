import { api } from '@/data/api/api';
import type {
  ValidarCheckoutData,
  ValidarCheckoutResponse,
} from '@/data/types/checkout/checkout.types';

export const checkoutService = {
  async validar(
    dados: ValidarCheckoutData,
  ): Promise<ValidarCheckoutResponse> {
    const { data } = await api.post<ValidarCheckoutResponse>(
      '/checkout/validar',
      dados,
    );

    return data;
  },
};
