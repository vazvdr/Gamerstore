import 'server-only';
import { createHash } from 'node:crypto';
import type {
  SessionRefreshResponse,
  SessionRefreshResult,
  SessionTokens,
  SessionUsuario,
} from '../../../data/types/sessao/sessao.types';

const renovacoesEmAndamento = new Map<
  string,
  Promise<SessionRefreshResult>
>();

function gerarChave(refreshToken: string): string {
  return createHash('sha256')
    .update(refreshToken)
    .digest('hex');
}

function validarTokens(data: unknown): data is SessionRefreshResponse {
  if (!data || typeof data !== 'object') return false;

  const response = data as Record<string, unknown>;

  return (
    typeof response.access_token === 'string' &&
    response.access_token.length > 0 &&
    typeof response.refresh_token === 'string' &&
    response.refresh_token.length > 0 &&
    typeof response.id === 'string' &&
    typeof response.nome === 'string' &&
    typeof response.email === 'string'
  );
}

function extrairUsuario(data: SessionRefreshResponse): SessionUsuario {
  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    ...(typeof data.admin === 'boolean' && {
      admin: data.admin,
    }),
  };
}

async function executarRenovacao(
  refreshToken: string,
): Promise<SessionRefreshResult> {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return {
      status: 'unavailable',
      message: 'A URL do backend não está configurada.',
    };
  }

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/+$/, '')}/usuarios/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
      },
    );

    if (response.status === 401 || response.status === 403) {
      return { status: 'invalid' };
    }

    if (!response.ok) {
      return {
        status: 'unavailable',
        message: 'O backend não conseguiu renovar a sessão.',
        httpStatus: response.status,
      };
    }

    let data: unknown;

    try {
      data = await response.json();
    } catch {
      return {
        status: 'unavailable',
        message: 'O backend retornou uma resposta inválida.',
        httpStatus: response.status,
      };
    }

    if (!validarTokens(data)) {
      return {
        status: 'unavailable',
        message: 'Os dados de renovação retornados pelo backend são inválidos.',
        httpStatus: response.status,
      };
    }

    const tokens: SessionTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };

    return {
      status: 'success',
      tokens,
      usuario: extrairUsuario(data),
    };
  } catch {
    return {
      status: 'unavailable',
      message: 'Não foi possível conectar ao backend.',
    };
  }
}

export function renovarSessao(
  refreshToken: string,
): Promise<SessionRefreshResult> {
  const chave = gerarChave(refreshToken);

  const renovacaoExistente = renovacoesEmAndamento.get(chave);

  if (renovacaoExistente) {
    return renovacaoExistente;
  }

  const renovacao = executarRenovacao(refreshToken).finally(() => {
    renovacoesEmAndamento.delete(chave);
  });

  renovacoesEmAndamento.set(chave, renovacao);

  return renovacao;
}
