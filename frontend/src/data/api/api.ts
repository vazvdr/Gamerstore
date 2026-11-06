import axios from 'axios';
import { normalizarErro } from '@/data/errors/api-error';

const headers = { 'Content-Type': 'application/json' };

export const api = axios.create({
  baseURL: '/api/backend',
  headers,
  timeout: 15000,
});
export const authApi = axios.create({
  baseURL: '/api',
  headers,
  timeout: 15000,
});
function tratarErro(error: unknown) {
  return Promise.reject(normalizarErro(error));
}
api.interceptors.response.use(
  (response) => response,
  tratarErro,
);
authApi.interceptors.response.use(
  (response) => response,
  tratarErro,
);