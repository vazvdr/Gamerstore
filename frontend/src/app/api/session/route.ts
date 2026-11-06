import { NextRequest, NextResponse } from 'next/server';
import { renovarSessao } from '@/lib/server/session/sessao.service';

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
function encerrarSessao() {
  const response = NextResponse.json(
    { usuario: null },
    { status: 401 },
  );
  response.cookies.set('access_token', '', cookieOptions(0));
  response.cookies.set('refresh_token', '', cookieOptions(0));
  return response;
}
export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value;
  if (!refreshToken) {
    return NextResponse.json(
      { usuario: null },
      { status: 401 },
    );
  }
  const resultado = await renovarSessao(refreshToken);
  if (resultado.status === 'invalid') {
    return encerrarSessao();
  }
  if (resultado.status === 'unavailable') {
    return NextResponse.json(
      { message: 'Não foi possível restaurar a sessão.' },
      { status: 502 },
    );
  }
  const response = NextResponse.json({
    usuario: resultado.usuario,
  });
  response.cookies.set(
    'access_token',
    resultado.tokens.access_token,
    cookieOptions(ACCESS_MAX_AGE),
  );
  response.cookies.set(
    'refresh_token',
    resultado.tokens.refresh_token,
    cookieOptions(REFRESH_MAX_AGE),
  );
  return response;
}
