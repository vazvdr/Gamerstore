import axios from 'axios';
const headers = { 'Content-Type': 'application/json' };
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers,
  timeout: 10000,
});
export const authApi = axios.create({
  baseURL: '',
  headers,
  timeout: 10000,
});
function tratarErro(error: unknown) {
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
}
api.interceptors.response.use((response) => response, tratarErro);
authApi.interceptors.response.use((response) => response, tratarErro);