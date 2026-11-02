'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useUsuario } from '@/data/hooks/useUsuario';
import AuthCard from '@/components/login/AuthCard';
import RecuperarSenhaDialog from '@/components/login/RecuperarSenhaDialog';

interface LoginFormProps {
  onSwitch: () => void;
}

export default function LoginForm({ onSwitch }: LoginFormProps) {
  const { login, loading, erro, sucesso, limparMensagens } = useUsuario();
  const [recuperarSenhaAberto, setRecuperarSenhaAberto] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await login({
      email: String(form.get('email') ?? '').trim().toLowerCase(),
      senha: String(form.get('senha') ?? ''),
    });
  }
  return (
    <>
      <AuthCard title="Entrar na sua conta">
        <form onSubmit={handleSubmit} onChange={limparMensagens} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-zinc-200">
              E-mail
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              required
              className="w-full rounded-lg border border-lime-500/70 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-400 focus:ring-2 focus:ring-lime-500/20"/>
          </div>
          <div>
            <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-zinc-200">
              Senha
            </label>
            <div className="relative">
              <input
                id="login-password"
                name="senha"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Digite sua senha"
                minLength={8}
                required
                className="w-full rounded-lg border border-lime-500/70 bg-black px-4 py-3 pr-12 text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-400 focus:ring-2 focus:ring-lime-500/20"/>
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={mostrarSenha}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-zinc-400 transition hover:text-lime-400">
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => setRecuperarSenhaAberto(true)}
                className="cursor-pointer text-sm text-lime-400 transition hover:text-lime-300 hover:underline">
                Esqueceu sua senha?
              </button>
            </div>
          </div>
          {erro && <p role="alert" className="text-sm text-red-400">{erro}</p>}
          {sucesso && <p role="status" className="text-sm text-lime-400">{sucesso}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-lime-500 px-4 py-3 font-bold text-black transition hover:border-black hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-400">
          Ainda não tem uma conta?{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="cursor-pointer font-semibold text-lime-400 transition hover:text-lime-300 hover:underline">
            Cadastre-se
          </button>
        </p>
      </AuthCard>
      <RecuperarSenhaDialog
        open={recuperarSenhaAberto}
        onClose={() => setRecuperarSenhaAberto(false)}
      />
    </>
  );
}
