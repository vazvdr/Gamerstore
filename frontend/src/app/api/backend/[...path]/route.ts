import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
const ACCESS_MAX_AGE = 15 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

type Tokens = {
  access_token: string;
  refresh_token: string;
};

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

function limparCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, '', cookieOptions(0));
  response.cookies.set(REFRESH_COOKIE, '', cookieOptions(0));
}
function validarTokens(data: unknown): data is Tokens {
  if (!data || typeof data !== 'object') return false;
  const tokens = data as Record<string, unknown>;
  return (
    typeof tokens.access_token === 'string' &&
    tokens.access_token.length > 0 &&
    typeof tokens.refresh_token === 'string' &&
    tokens.refresh_token.length > 0
  );
}

async function renovarTokens(refreshToken: string): Promise<Tokens | null> {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error('API_URL não está configurada.');
  }
  try {
    const response = await fetch(
      `${apiUrl.replace(/\/+$/, '')}/usuarios/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
      },
    );
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return validarTokens(data) ? data : null;
  } catch {
    return null;
  }
}
async function encaminhar(
  request: NextRequest,
  path: string[],
  method: string,
) {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { message: 'URL da API não configurada.' },
      { status: 500 },
    );
  }
  // Protege operações que modificam dados contra requisições cross-origin.
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const origin = request.headers.get('origin');
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json(
        { message: 'Origem da requisição não autorizada.' },
        { status: 403 },
      );
    }
  }
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  let accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const baseUrl = apiUrl.replace(/\/+$/, '');
  const endpoint = `${baseUrl}/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;
  let tokensAtualizados: Tokens | null = null;
  // Se não houver access token, tenta restaurar a sessão.
  if (!accessToken && refreshToken) {
    tokensAtualizados = await renovarTokens(refreshToken);
    accessToken = tokensAtualizados?.access_token;
  }
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const accept = request.headers.get('accept');
  if (accept) headers.set('accept', accept);
  if (accessToken) {
    headers.set('authorization', `Bearer ${accessToken}`);
  }
  const body =
    method !== 'GET' && method !== 'HEAD'
      ? await request.arrayBuffer()
      : undefined;
  const executarRequisicao = (token?: string) => {
    const requestHeaders = new Headers(headers);
    if (token) {
      requestHeaders.set('authorization', `Bearer ${token}`);
    } else {
      requestHeaders.delete('authorization');
    }
    return fetch(endpoint, {
      method,
      headers: requestHeaders,
      body,
      cache: 'no-store',
    });
  };
  let upstreamResponse: Response;
  try {
    upstreamResponse = await executarRequisicao(accessToken);
  } catch {
    return NextResponse.json(
      { message: 'Não foi possível conectar à API Gateway.' },
      { status: 502 },
    );
  }
  // Renova a sessão somente uma vez se o access token for rejeitado.
  if (upstreamResponse.status === 401 && refreshToken && !tokensAtualizados) {
    tokensAtualizados = await renovarTokens(refreshToken);
    if (tokensAtualizados) {
      try {
        upstreamResponse = await executarRequisicao(
          tokensAtualizados.access_token,
        );
      } catch {
        return NextResponse.json(
          { message: 'Não foi possível conectar à API Gateway.' },
          { status: 502 },
        );
      }
    }
  }
  const responseHeaders = new Headers();
  const responseContentType = upstreamResponse.headers.get('content-type');
  if (responseContentType) {
    responseHeaders.set('content-type', responseContentType);
  }
  const response = new NextResponse(
    [204, 205, 304].includes(upstreamResponse.status)
      ? null
      : await upstreamResponse.arrayBuffer(),
    {
      status: upstreamResponse.status,
      headers: responseHeaders,
    },
  );
  if (tokensAtualizados) {
    response.cookies.set(
      ACCESS_COOKIE,
      tokensAtualizados.access_token,
      cookieOptions(ACCESS_MAX_AGE),
    );
    response.cookies.set(
      REFRESH_COOKIE,
      tokensAtualizados.refresh_token,
      cookieOptions(REFRESH_MAX_AGE),
    );
  }
  // Se o refresh falhou, encerra a sessão local.
  if (
    upstreamResponse.status === 401 &&
    refreshToken &&
    !tokensAtualizados
  ) {
    limparCookies(response);
  }
  return response;
}
type RouteContext = { params: Promise<{ path: string[] }>};

async function handler(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return encaminhar(request, path, request.method);
}
export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as HEAD,
};