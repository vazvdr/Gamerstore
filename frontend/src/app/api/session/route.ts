import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!refreshToken) {
    return NextResponse.json({ usuario: null }, { status: 401 });
  }
  if (!apiUrl) {
    return NextResponse.json({ message: 'URL da API não configurada.' }, { status: 500 });
  }
  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/usuarios/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });
    const data = await response.json();
    if (!response.ok) {
      const result = NextResponse.json({ usuario: null }, { status: 401 });
      result.cookies.delete('access_token');
      result.cookies.delete('refresh_token');
      return result;
    }
    const { access_token, refresh_token, ...usuario } = data;
    if (!access_token || !refresh_token || !usuario.id || !usuario.nome || !usuario.email) {
      return NextResponse.json({ message: 'Resposta de renovação inválida.' }, { status: 502 });
    }
    const result = NextResponse.json({ usuario });
    const secure = process.env.NODE_ENV === 'production';
    result.cookies.set('access_token', access_token, {
      httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 15 * 60,
    });
    result.cookies.set('refresh_token', refresh_token, {
      httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60,
    });
    return result;
  } catch {
    return NextResponse.json({ message: 'Não foi possível restaurar a sessão.' }, { status: 500 });
  }
}