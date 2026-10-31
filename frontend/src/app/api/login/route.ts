import { NextRequest, NextResponse } from 'next/server';

const ACCESS_MAX_AGE = 15 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

interface LoginResponse {
  id: string;
  nome: string;
  email: string;
  access_token: string;
  refresh_token: string;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();
    if (
      typeof email !== 'string' ||
      typeof senha !== 'string' ||
      !email.trim() ||
      !senha
    ) {
      return NextResponse.json(
        { message: 'Informe seu e-mail e sua senha.' },
        { status: 400 },
      );
    }
    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { message: 'URL da API não configurada.' },
        { status: 500 },
      );
    }
    const response = await fetch(
      `${apiUrl.replace(/\/+$/, '')}/usuarios/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), senha }),
        cache: 'no-store',
      },
    );
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        {
          message: data.message ?? 'Não foi possível entrar na sua conta.',
        },
        { status: response.status },
      );
    }
    const usuario = data as LoginResponse;
    if (
      !usuario.access_token ||
      !usuario.refresh_token ||
      !usuario.id ||
      !usuario.nome ||
      !usuario.email
    ) {
      return NextResponse.json(
        { message: 'Resposta de autenticação inválida.' },
        { status: 502 },
      );
    }
    const result = NextResponse.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    });
    result.cookies.set(
      'access_token',
      usuario.access_token,
      cookieOptions(ACCESS_MAX_AGE),
    );
    result.cookies.set(
      'refresh_token',
      usuario.refresh_token,
      cookieOptions(REFRESH_MAX_AGE),
    );
    return result;
  } catch {
    return NextResponse.json(
      { message: 'Não foi possível conectar ao serviço de autenticação.' },
      { status: 500 },
    );
  }
}