
import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

const ACCESS_MAX_AGE = 15 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

interface RefreshResult {
  status: number;
  data: Record<string, unknown> | null;
}

const renovacoesEmAndamento = new Map<string, Promise<RefreshResult>>();

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

function encerrarSessao() {
  const response = NextResponse.json({ usuario: null }, { status: 401 });
  response.cookies.set('access_token', '', cookieOptions(0));
  response.cookies.set('refresh_token', '', cookieOptions(0));
  return response;
}

function renovarSessao(refreshToken: string, apiUrl: string) {
  const chave = createHash('sha256').update(refreshToken).digest('hex');
  const existente = renovacoesEmAndamento.get(chave);

  if (existente) return existente;

  const renovacao = (async (): Promise<RefreshResult> => {
    const response = await fetch(`${apiUrl.replace(/\/+$/, '')}/usuarios/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    return {
      status: response.status,
      data: data && typeof data === 'object' ? data : null,
    };
  })();

  renovacoesEmAndamento.set(chave, renovacao);

  void renovacao.then(
    () => {
      if (renovacoesEmAndamento.get(chave) === renovacao) renovacoesEmAndamento.delete(chave);
    },
    () => {
      if (renovacoesEmAndamento.get(chave) === renovacao) renovacoesEmAndamento.delete(chave);
    },
  );

  return renovacao;
}

export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const apiUrl = process.env.API_URL;

  if (!refreshToken) {
    return NextResponse.json({ usuario: null }, { status: 401 });
  }

  if (!apiUrl) {
    return NextResponse.json({ message: 'URL da API não configurada.' }, { status: 500 });
  }

  try {
    const { status, data } = await renovarSessao(refreshToken, apiUrl);

    if (!refreshToken) {
      return NextResponse.json({ usuario: null }, { status: 401 });
    }

    if (status < 200 || status >= 300) {
      return NextResponse.json(
        { message: 'Não foi possível renovar a sessão.' },
        { status: 502 },
      );
    }

    if (
      typeof data?.access_token !== 'string' ||
      typeof data?.refresh_token !== 'string' ||
      typeof data?.id !== 'string' ||
      typeof data?.nome !== 'string' ||
      typeof data?.email !== 'string'
    ) {
      return NextResponse.json(
        { message: 'Resposta de renovação inválida.' },
        { status: 502 },
      );
    }

    const result = NextResponse.json({
      usuario: {
        id: data.id,
        nome: data.nome,
        email: data.email,
      },
    });

    result.cookies.set('access_token', data.access_token, cookieOptions(ACCESS_MAX_AGE));
    result.cookies.set('refresh_token', data.refresh_token, cookieOptions(REFRESH_MAX_AGE));

    return result;
  } catch {
    return NextResponse.json(
      { message: 'Não foi possível restaurar a sessão.' },
      { status: 502 },
    );
  }
}
