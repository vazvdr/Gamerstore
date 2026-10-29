'use client';
import { useUsuario } from '@/data/hooks/useUsuario';
import AuthCard from '@/components/login/AuthCard';
interface LoginFormProps {
  onSwitch: () => void;
}
export default function LoginForm({ onSwitch }: LoginFormProps) {
  const { login, loading, erro, sucesso, limparMensagens } = useUsuario();
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await login({
      email: String(form.get('email') ?? '').trim().toLowerCase(),
      senha: String(form.get('senha') ?? ''),
    });
  }
  return (
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
            className="w-full rounded-lg border border-lime-500/70 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-400 focus:ring-2 focus:ring-lime-500/20"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-zinc-200">
            Senha
          </label>
          <input
            id="login-password"
            name="senha"
            type="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            minLength={8}
            required
            className="w-full rounded-lg border border-lime-500/70 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-400 focus:ring-2 focus:ring-lime-500/20"/>
          <div className="mt-2 text-right">
            <a href="/recuperar-senha" className="text-sm text-lime-400 transition hover:text-lime-300 hover:underline">
              Esqueceu sua senha?
            </a>
          </div>
        </div>
        {erro && <p role="alert" className="text-sm text-red-400">{erro}</p>}
        {sucesso && <p role="status" className="text-sm text-lime-400">{sucesso}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-lime-500 px-4 py-3 font-bold text-black transition hover:bg-white hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-400">
        Ainda não tem uma conta?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold text-lime-400 transition hover:text-lime-300 hover:underline cursor-pointer">
          Cadastre-se
        </button>
      </p>
    </AuthCard>
  );
}