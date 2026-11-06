'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/data/contexts/AuthContext';
import { usuarioService } from '@/data/services/usuario.service';
import { normalizarErro } from '@/data/errors/api-error';
import type {
  Usuario,
  CadastrarUsuarioData,
  LogarUsuarioData,
  EditarUsuarioData,
  DeletarUsuarioData,
  RedefinirSenhaData,
} from '../types/usuario/usuario.type';

export function useUsuario() {
  const router = useRouter();
  const {
    usuario: usuarioAutenticado,
    login: autenticar,
    atualizarUsuario,
    logout,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [erroLocal, setErroLocal] = useState('');
  const senhaAtualRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setNome(usuarioAutenticado?.nome ?? '');
    setEmail(usuarioAutenticado?.email ?? '');
  }, [usuarioAutenticado?.nome, usuarioAutenticado?.email]);

  async function executar<T>(
    operacao: () => Promise<T>,
    mensagemFallback: string,
  ): Promise<T | null> {
    setLoading(true);
    setErro('');
    setSucesso('');
    try {
      return await operacao();
    } catch (error) {
      setErro(normalizarErro(error, mensagemFallback).message);
      return null;
    } finally {
      setLoading(false);
    }
  }
  async function cadastrar(
    dados: CadastrarUsuarioData,
  ): Promise<Usuario | null> {
    const usuario = await executar(
      () => usuarioService.cadastrar(dados),
      'Não foi possível criar sua conta.',
    );
    if (usuario) {
      setSucesso('Conta criada com sucesso!');
    }
    return usuario;
  }
  async function login(
    dados: LogarUsuarioData,
  ): Promise<Usuario | null> {
    const usuario = await executar(
      () => autenticar(dados),
      'Não foi possível entrar na sua conta.',
    );
    if (usuario) {
      setSucesso('Login realizado com sucesso!');
      router.push('/');
    }
    return usuario;
  }
  async function editar(
    dados: EditarUsuarioData,
  ): Promise<Usuario | null> {
    const usuario = await executar(
      () => usuarioService.editar(dados),
      'Não foi possível atualizar seus dados.',
    );
    if (usuario) {
      atualizarUsuario(usuario);
      setSucesso('Dados atualizados com sucesso!');
    }
    return usuario;
  }
  async function deletar(
    dados: DeletarUsuarioData,
  ): Promise<boolean> {
    const resultado = await executar(
      () => usuarioService.deletar(dados),
      'Não foi possível excluir sua conta.',
    );
    if (!resultado) return false;
    try {
      await logout();
    } catch {
      setErro(
        'Sua conta foi excluída, mas não foi possível encerrar a sessão corretamente.',
      );
    }
    router.replace('/');
    router.refresh();
    return true;
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    limparMensagens();
    if (!usuarioAutenticado) {
      setErroLocal('Não foi possível identificar o usuário autenticado.');
      return;
    }
    if (!senhaAtual) {
      setErroLocal('Informe sua senha atual para confirmar as alterações.');
      senhaAtualRef.current?.focus();
      return;
    }
    const dados: EditarUsuarioData = { senhaAtual };
    const nomeNormalizado = nome.trim();
    const emailNormalizado = email.trim().toLowerCase();
    if (nomeNormalizado !== usuarioAutenticado.nome) {
      dados.nome = nomeNormalizado;
    }
    if (emailNormalizado !== usuarioAutenticado.email) {
      dados.email = emailNormalizado;
    }
    if (novaSenha) {
      dados.novaSenha = novaSenha;
    }
    if (Object.keys(dados).length === 1) {
      setErroLocal('Altere pelo menos um dado antes de salvar.');
      return;
    }
    const atualizado = await editar(dados);
    if (atualizado) {
      setSenhaAtual('');
      setNovaSenha('');
    }
  }
  async function handleDeleteAccount(): Promise<boolean> {
    limparMensagens();
    if (!usuarioAutenticado) {
      setErroLocal('Não foi possível identificar o usuário autenticado.');
      return false;
    }
    if (!senhaAtual.trim()) {
      setErroLocal(
        'Informe sua senha atual no campo acima para excluir sua conta.',
      );
      senhaAtualRef.current?.focus();
      return false;
    }
    return await deletar({ senhaAtual });
  }
  async function recuperarSenha(email: string): Promise<boolean> {
    const response = await executar(
      () =>
        usuarioService.recuperarSenha({
          email: email.trim().toLowerCase(),
        }),
      'Não foi possível solicitar a recuperação de senha.',
    );
    if (!response) return false;
    setSucesso(response.message);
    return true;
  }
  async function redefinirSenha(
    dados: RedefinirSenhaData,
  ): Promise<boolean> {
    const response = await executar(
      () => usuarioService.redefinirSenha(dados),
      'Não foi possível redefinir sua senha.',
    );
    if (!response) return false;
    setSucesso(response.message);
    return true;
  }
  function limparMensagens() {
    setErro('');
    setSucesso('');
    setErroLocal('');
  }
  return {
    cadastrar,
    login,
    editar,
    deletar,
    loading,
    erro,
    sucesso,
    limparMensagens,
    usuario: usuarioAutenticado,
    nome,
    setNome,
    email,
    setEmail,
    senhaAtual,
    setSenhaAtual,
    novaSenha,
    setNovaSenha,
    senhaAtualRef,
    erroLocal,
    handleSubmit,
    handleDeleteAccount,
    recuperarSenha,
    redefinirSenha,
  };
}
