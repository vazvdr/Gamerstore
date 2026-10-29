'use client';
import { useUsuario } from '@/data/hooks/useUsuario';
import AuthCard from '@/components/login/AuthCard';

interface RegisterFormProps {
    onSwitch: () => void;
}

export default function RegisterForm({ onSwitch }: RegisterFormProps) {
    const { cadastrar, loading, erro, sucesso, limparMensagens } = useUsuario();
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formElement = event.currentTarget;
        const form = new FormData(formElement);
        const usuario = await cadastrar({
            nome: String(form.get('nome') ?? '').trim(),
            email: String(form.get('email') ?? '').trim().toLowerCase(),
            senha: String(form.get('senha') ?? ''),
        });
        if (usuario) formElement.reset();
    }
    return (
        <AuthCard title="Criar sua conta">
            <form onSubmit={handleSubmit} onChange={limparMensagens} className="space-y-5">
                <div>
                    <label htmlFor="register-name" className="mb-2 block text-sm font-medium text-zinc-200">
                        Nome
                    </label>
                    <input
                        id="register-name"
                        name="nome"
                        type="text"
                        autoComplete="name"
                        placeholder="Seu nome completo"
                        minLength={2}
                        maxLength={150}
                        required
                        className="w-full rounded-lg border border-lime-500/70 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-400 focus:ring-2 focus:ring-lime-500/20"
                    />
                </div>
                <div>
                    <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-zinc-200">
                        E-mail
                    </label>
                    <input
                        id="register-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="seu@email.com"
                        maxLength={255}
                        required
                        className="w-full rounded-lg border border-lime-500/70 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-400 focus:ring-2 focus:ring-lime-500/20"
                    />
                </div>
                <div>
                    <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-zinc-200">
                        Senha
                    </label>
                    <input
                        id="register-password"
                        name="senha"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Crie uma senha"
                        minLength={8}
                        maxLength={128}
                        required
                        className="w-full rounded-lg border border-lime-500/70 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-400 focus:ring-2 focus:ring-lime-500/20"
                    />
                    <p className="mt-2 text-xs text-zinc-500">A senha deve ter pelo menos 8 caracteres.</p>
                </div>
                {erro && <p role="alert" className="text-sm text-red-400">{erro}</p>}
                {sucesso && <p role="status" className="text-sm text-lime-400">{sucesso}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-lime-500 px-4 py-3 font-bold text-black transition hover:bg-lime-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer">
                    {loading ? 'Criando conta...' : 'Criar conta'}
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-zinc-400">
                Já tem uma conta?{' '}
                <button
                    type="button"
                    onClick={onSwitch}
                    className="font-semibold text-lime-400 transition hover:text-lime-300 hover:underline cursor-pointer">
                    Fazer login
                </button>
            </p>
        </AuthCard>
    );
}