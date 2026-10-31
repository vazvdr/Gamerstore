'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/data/contexts/AuthContext';
import { usuarioService } from '@/data/services/usuario.service';
import { Usuario, CadastrarUsuarioData, LogarUsuarioData, EditarUsuarioData,
  DeletarUsuarioData
} from '../types/usuario/usuario.type';

export function useUsuario() {
  const router = useRouter();
  const { usuario: usuarioAutenticado, login: autenticar, atualizarUsuario, logout } = useAuth();
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

  async function cadastrar(dados: CadastrarUsuarioData): Promise<Usuario | null> {
    setLoading(true);
    setErro('');
    setSucesso('');
    try {
      const usuario = await usuarioService.cadastrar(dados);
      setSucesso('Conta criada com sucesso!');
      return usuario;
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível criar sua conta.');
      return null;
    } finally {
      setLoading(false);
    }
  }
  async function login(dados: LogarUsuarioData): Promise<Usuario | null> {
    setLoading(true);
    setErro('');
    setSucesso('');
    try {
      const usuario = await autenticar(dados);
      setSucesso('Login realizado com sucesso!');
      router.push('/');
      return usuario;
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível entrar na sua conta.');
      return null;
    } finally {
      setLoading(false);
    }
  }
  async function editar(dados: EditarUsuarioData): Promise<Usuario | null> {
    setLoading(true);
    setErro('');
    setSucesso('');
    try {
      const usuario = await usuarioService.editar(dados);
      atualizarUsuario(usuario);
      setSucesso('Dados atualizados com sucesso!');
      return usuario;
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível atualizar seus dados.');
      return null;
    } finally {
      setLoading(false);
    }
  }
  async function deletar(dados: DeletarUsuarioData): Promise<boolean> {
    setLoading(true);
    setErro('');
    setSucesso('');
    try {
      await usuarioService.deletar(dados);
      await logout();
      router.replace('/');
      router.refresh();
      return true;
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível excluir sua conta.');
      return false;
    } finally {
      setLoading(false);
    }
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    limparMensagens();
    setErroLocal('');
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
    if (nomeNormalizado !== usuarioAutenticado.nome) dados.nome = nomeNormalizado;
    if (emailNormalizado !== usuarioAutenticado.email) dados.email = emailNormalizado;
    if (novaSenha) dados.novaSenha = novaSenha;
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
  async function handleDeleteAccount() {
    limparMensagens();
    setErroLocal('');
    if (!usuarioAutenticado) {
      setErroLocal('Não foi possível identificar o usuário autenticado.');
      return;
    }
    if (!senhaAtual.trim()) {
      setErroLocal('Informe sua senha atual no campo acima para excluir sua conta.');
      senhaAtualRef.current?.focus();
      return;
    }
    if (!window.confirm('Tem certeza de que deseja excluir sua conta? Essa ação não pode ser desfeita.')) return;
    await deletar({ senhaAtual });
  }
  function limparMensagens() {
    setErro('');
    setSucesso('');
    setErroLocal('');
  }
  return { cadastrar, login, editar, deletar, loading, erro, sucesso, limparMensagens, usuario: usuarioAutenticado,
    nome, setNome, email, setEmail, senhaAtual, setSenhaAtual, novaSenha, setNovaSenha, senhaAtualRef, erroLocal,
    handleSubmit, handleDeleteAccount};
}