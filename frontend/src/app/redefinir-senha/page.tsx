'use client';
import { useState, type FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LockKeyhole, CheckCircle2, AlertCircle, LoaderCircle, ArrowLeft } from 'lucide-react';
import { useUsuario } from '@/data/hooks/useUsuario';

export default function RedefinirSenhaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const { redefinirSenha, loading, erro, sucesso } = useUsuario();
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erroLocal, setErroLocal] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroLocal('');
    if (senha.length < 8) {
      setErroLocal('A senha deve possuir pelo menos 8 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      setErroLocal('As senhas informadas não coincidem.');
      return;
    }
    const sucesso = await redefinirSenha({ token, senha });
    if (sucesso) {
      setSenha('');
      setConfirmarSenha('');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-lime-500/40 bg-zinc-950 p-6 shadow-2xl shadow-lime-500/5 sm:p-8">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-lime-500/30 bg-lime-500/10 text-lime-400">
          <LockKeyhole size={24} />
        </div>
        <h1 className="text-2xl font-bold text-white">Redefinir senha</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Informe sua nova senha para recuperar o acesso à sua conta.
        </p>
        {!token ? (
          <div className="mt-6 space-y-5">
            <p role="alert" className="flex items-start gap-2 text-sm text-red-400">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              Link de recuperação inválido ou sem token.
            </p>
            <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-lime-400 transition hover:text-lime-300">
              <ArrowLeft size={16} />
              Voltar para o login
            </Link>
          </div>
        ) : sucesso ? (
          <div className="mt-6 space-y-5">
            <p role="status" className="flex items-start gap-2 text-sm text-lime-400">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              {sucesso}
            </p>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full cursor-pointer rounded-lg bg-lime-500 px-4 py-3 font-bold text-black transition hover:bg-white">
              Ir para o login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="nova-senha" className="mb-2 block text-sm font-medium text-zinc-200">
                Nova senha
              </label>
              <input
                id="nova-senha"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={loading}
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Digite sua nova senha"
                className="w-full rounded-lg border border-lime-500/70 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-400 focus:ring-2 focus:ring-lime-500/20 disabled:opacity-60"/>
            </div>
            <div>
              <label htmlFor="confirmar-senha" className="mb-2 block text-sm font-medium text-zinc-200">
                Confirmar nova senha
              </label>
              <input
                id="confirmar-senha"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={loading}
                value={confirmarSenha}
                onChange={(event) => setConfirmarSenha(event.target.value)}
                placeholder="Confirme sua nova senha"
                className="w-full rounded-lg border border-lime-500/70 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-400 focus:ring-2 focus:ring-lime-500/20 disabled:opacity-60"/>
            </div>
            {(erroLocal || erro) && (
              <p role="alert" className="flex items-start gap-2 text-sm text-red-400">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                {erroLocal || erro}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-lime-500 px-4 py-3 font-bold text-black transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Redefinindo...
                </>
              ) : 'Redefinir senha'}
            </button>
          </form>
        )}
        {!sucesso && (
          <Link
            href="/login"
            className="mt-5 flex items-center justify-center gap-2 py-2 text-sm text-zinc-400 transition hover:text-lime-400">
            <ArrowLeft size={16} />
            Voltar para o login
          </Link>
        )}
      </div>
    </main>
  );
}
