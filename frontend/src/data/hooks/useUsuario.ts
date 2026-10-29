'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/data/contexts/AuthContext';
import { usuarioService, type CadastrarUsuarioData, type LogarUsuarioData, type Usuario } from '@/data/services/usuario.service';

export function useUsuario() {
  const router = useRouter();
  const { login: autenticar } = useAuth();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

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
  function limparMensagens() {
    setErro('');
    setSucesso('');
  }
  return { cadastrar, login, loading, erro, sucesso, limparMensagens };
}