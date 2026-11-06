import { NextRequest, NextResponse } from 'next/server';
import { renovarSessao } from '@/lib/server/session/sessao.service';
const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
const ACCESS_MAX_AGE = 15 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;
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
function atualizarCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
) {
  response.cookies.set(
    ACCESS_COOKIE,
    accessToken,
    cookieOptions(ACCESS_MAX_AGE),
  );
  response.cookies.set(
    REFRESH_COOKIE,
    refreshToken,
    cookieOptions(REFRESH_MAX_AGE),
  );
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
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const baseUrl = apiUrl.replace(/\/+$/, '');
  const endpoint = `${baseUrl}/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;
  let accessTokenAtual = accessToken;
  let tokensAtualizados: {
    access_token: string;
    refresh_token: string;
  } | null = null;
  let sessaoInvalida = false;
  // Sem access token, tenta restaurar a sessão utilizando o refresh token.
  if (!accessTokenAtual && refreshToken) {
    const resultado = await renovarSessao(refreshToken);
    if (resultado.status === 'success') {
      tokensAtualizados = resultado.tokens;
      accessTokenAtual = resultado.tokens.access_token;
    } else if (resultado.status === 'invalid') {
      sessaoInvalida = true;
    } else {
      return NextResponse.json(
        { message: 'Não foi possível renovar a sessão.' },
        { status: 502 },
      );
    }
  }
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('content-type', contentType);
  }
  const accept = request.headers.get('accept');
  if (accept) {
    headers.set('accept', accept);
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
    upstreamResponse = await executarRequisicao(accessTokenAtual);
  } catch {
    return NextResponse.json(
      { message: 'Não foi possível conectar à API Gateway.' },
      { status: 502 },
    );
  }
  // Se o access token foi rejeitado, tenta renová-lo uma única vez.
  if (
    upstreamResponse.status === 401 &&
    refreshToken &&
    !tokensAtualizados &&
    !sessaoInvalida
  ) {
    const resultado = await renovarSessao(refreshToken);
    if (resultado.status === 'success') {
      tokensAtualizados = resultado.tokens;
      try {
        upstreamResponse = await executarRequisicao(
          resultado.tokens.access_token,
        );
      } catch {
        return NextResponse.json(
          { message: 'Não foi possível conectar à API Gateway.' },
          { status: 502 },
        );
      }
    } else if (resultado.status === 'invalid') {
      sessaoInvalida = true;
    } else {
      return NextResponse.json(
        { message: 'Não foi possível renovar a sessão.' },
        { status: 502 },
      );
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
    atualizarCookies(
      response,
      tokensAtualizados.access_token,
      tokensAtualizados.refresh_token,
    );
  }
  if (sessaoInvalida) {
    limparCookies(response);
  }
  return response;
}
type RouteContext = {
  params: Promise<{ path: string[] }>;
};
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
