
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();
    const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      return NextResponse.json({ message: 'URL da API não configurada.' }, { status: 500 });
    }

    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message ?? 'Não foi possível entrar na sua conta.' },
        { status: response.status },
      );
    }

    const { access_token, refresh_token, id, nome, email: userEmail, admin } = data;

    if (!access_token || !refresh_token || !id || !nome || !userEmail) {
      return NextResponse.json({ message: 'Resposta de autenticação inválida.' }, { status: 502 });
    }

    const result = NextResponse.json({ id, nome, email: userEmail, ...(admin !== undefined && { admin }) });

    const secure = process.env.NODE_ENV === 'production';

    result.cookies.set('access_token', access_token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    result.cookies.set('refresh_token', refresh_token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return result;
  } catch {
    return NextResponse.json({ message: 'Não foi possível conectar ao serviço de autenticação.' }, { status: 500 });
  }
}
