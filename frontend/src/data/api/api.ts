
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => config,
  (error: unknown) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      return Promise.reject(
        new Error(
          Array.isArray(message)
            ? message.join(', ')
            : typeof message === 'string'
              ? message
              : error.response
                ? `Erro na API: ${error.response.status}`
                : error.code === 'ECONNABORTED'
                  ? 'A requisição excedeu o tempo limite.'
                  : 'Não foi possível conectar ao backend.',
        ),
      );
    }

    return Promise.reject(error);
  },
);
