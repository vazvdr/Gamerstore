import axios from 'axios';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function extrairMensagem(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;

  const response = data as Record<string, unknown>;
  const message = response.message;

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (
    Array.isArray(message) &&
    message.every((item) => typeof item === 'string')
  ) {
    return message.join(', ');
  }

  return undefined;
}

function mensagemPorStatus(status?: number): string {
  switch (status) {
    case 400:
      return 'Os dados enviados são inválidos.';
    case 401:
      return 'Sua sessão expirou ou suas credenciais são inválidas.';
    case 403:
      return 'Você não tem permissão para realizar esta operação.';
    case 404:
      return 'O recurso solicitado não foi encontrado.';
    case 409:
      return 'Não foi possível concluir a operação devido a um conflito.';
    case 422:
      return 'Não foi possível processar os dados enviados.';
    case 429:
      return 'Muitas requisições. Tente novamente em instantes.';
    case 500:
      return 'Ocorreu um erro interno no servidor.';
    case 502:
    case 503:
    case 504:
      return 'O serviço está temporariamente indisponível.';
    default:
      return 'Não foi possível concluir a operação.';
  }
}

export function normalizarErro(
  error: unknown,
  fallback = 'Ocorreu um erro inesperado.',
): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message =
      extrairMensagem(error.response?.data) ??
      (status ? mensagemPorStatus(status) : undefined) ??
      (error.code === 'ECONNABORTED'
        ? 'A requisição excedeu o tempo limite.'
        : !error.response
          ? 'Não foi possível conectar ao servidor.'
          : fallback);

    return new ApiError(message, status, error.code);
  }

  if (error instanceof Error) {
    return new ApiError(error.message || fallback);
  }

  return new ApiError(fallback);
}
