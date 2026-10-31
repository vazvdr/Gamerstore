'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useUsuario } from '@/data/hooks/useUsuario';

const inputClassName = 'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 disabled:cursor-not-allowed disabled:opacity-60';

export default function PersonalDataAccordion() {
  const { usuario, nome, setNome, email, setEmail, senhaAtual, setSenhaAtual, novaSenha, 
    setNovaSenha, senhaAtualRef, erroLocal, erro, sucesso, loading, handleSubmit, handleDeleteAccount } = useUsuario();

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
      <Accordion>
        <AccordionItem value="personal-data" className="border-0">
          <AccordionTrigger className="items-center py-2 hover:no-underline">
            <div>
              <h2 className="text-base font-semibold text-white">Dados cadastrais</h2>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Atualize seus dados como nome, e-mail e senha.
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="account-name" className="text-sm font-medium text-zinc-300">Nome</label>
                <input
                  id="account-name"
                  name="nome"
                  type="text"
                  autoComplete="name"
                  minLength={2}
                  maxLength={150}
                  placeholder="Seu nome completo"
                  className={inputClassName}
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  disabled={loading}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="account-email" className="text-sm font-medium text-zinc-300">E-mail</label>
                <input
                  id="account-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={255}
                  placeholder="seu@email.com"
                  className={inputClassName}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="account-current-password" className="text-sm font-medium text-zinc-300">Senha atual</label>
                <input
                  ref={senhaAtualRef}
                  id="account-current-password"
                  name="senhaAtual"
                  type="password"
                  autoComplete="current-password"
                  maxLength={128}
                  placeholder="Confirme sua senha atual"
                  className={inputClassName}
                  value={senhaAtual}
                  onChange={(event) => setSenhaAtual(event.target.value)}
                  disabled={loading}
                  required/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="account-new-password" className="text-sm font-medium text-zinc-300">Nova senha</label>
                <input
                  id="account-new-password"
                  name="novaSenha"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  placeholder="Nova senha (se quiser alterar)"
                  className={inputClassName}
                  value={novaSenha}
                  onChange={(event) => setNovaSenha(event.target.value)}
                  disabled={loading}/>
              </div>
              {(erroLocal || erro) && (
                <p role="alert" className="text-sm text-red-400">{erroLocal || erro}</p>
              )}
              {sucesso && (
                <p role="status" className="text-sm text-lime-400">{sucesso}</p>
              )}
              <button
                type="submit"
                disabled={loading || !usuario}
                className="mt-1 w-full cursor-pointer rounded-lg bg-lime-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Salvando...' : 'Salvar dados'}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={loading || !usuario}
                className="w-full cursor-pointer rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Processando...' : 'Excluir conta'}
              </button>
            </form>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}