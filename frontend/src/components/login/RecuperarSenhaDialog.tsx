'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X, Mail, LockKeyhole, CheckCircle2, AlertCircle, LoaderCircle } from 'lucide-react';
import { useUsuario } from '@/data/hooks/useUsuario';

interface RecuperarSenhaDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function RecuperarSenhaDialog({ open, onClose }: RecuperarSenhaDialogProps) {
  const [email, setEmail] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const { recuperarSenha, loading, erro, sucesso, limparMensagens } = useUsuario();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !loading) onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, loading]);

  useEffect(() => {
    if (open) {
      setEmail('');
      limparMensagens();
    }
  }, [open]);
  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    await recuperarSenha(email);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recuperar-senha-title"
        className="relative w-full max-w-md rounded-2xl border border-lime-500/40 bg-zinc-950 p-6 shadow-2xl shadow-lime-500/5 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Fechar diálogo"
          className="absolute right-4 top-4 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
          <X size={20} />
        </button>
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-lime-500/30 bg-lime-500/10 text-lime-400">
          <LockKeyhole size={24} />
        </div>
        <h2 id="recuperar-senha-title" className="text-2xl font-bold text-white">
          Recuperar senha
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Informe o e-mail cadastrado na sua conta. Você poderá utilizá-lo para iniciar a recuperação da sua senha.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="recuperar-senha-email" className="mb-2 block text-sm font-medium text-zinc-200">
              E-mail
            </label>
            <div className="relative">
              <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="recuperar-senha-email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                disabled={loading || !!sucesso}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-lg border border-lime-500/70 bg-black py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-400 focus:ring-2 focus:ring-lime-500/20 disabled:opacity-60"/>
            </div>
          </div>
          {erro && (
            <p role="alert" className="flex items-start gap-2 text-sm text-red-400">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              {erro}
            </p>
          )}
          {sucesso && (
            <p role="status" className="flex items-start gap-2 text-sm text-lime-400">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              {sucesso}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !!sucesso}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-lime-500 px-4 py-3 font-bold text-black transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Enviando...
              </>
            ) : sucesso ? 'Solicitação enviada' : 'Enviar'}
          </button>
        </form>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="mt-4 w-full cursor-pointer py-2 text-sm text-zinc-400 transition hover:text-lime-400 disabled:opacity-50">
          Voltar para o login
        </button>
      </div>
    </div>
  );
}