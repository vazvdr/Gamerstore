
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { usuarioService } from '@/data/services/usuario.service';
import type {
  LogarUsuarioData,
  Usuario,
} from '../types/usuario/usuario.type';

interface AuthContextData {
  usuario: Usuario | null;
  autenticado: boolean;
  carregandoSessao: boolean;
  login: (dados: LogarUsuarioData) => Promise<Usuario>;
  atualizarUsuario: (usuario: Usuario) => void;
  logout: () => Promise<void>;
}

interface SessionResponse {
  usuario: unknown;
}

// Compartilha a restauração entre execuções simultâneas do efeito.
let restauracaoEmAndamento: Promise<Usuario | null> | null = null;

function validarUsuario(data: unknown): data is Usuario {
  if (!data || typeof data !== 'object') return false;

  const usuario = data as Record<string, unknown>;

  return (
    typeof usuario.id === 'string' &&
    typeof usuario.nome === 'string' &&
    typeof usuario.email === 'string'
  );
}

function restaurarSessao(): Promise<Usuario | null> {
  if (!restauracaoEmAndamento) {
    restauracaoEmAndamento = (async () => {
      try {
        const response = await fetch('/api/session', {
          cache: 'no-store',
        });

        if (!response.ok) return null;

        const data: SessionResponse = await response.json();

        return validarUsuario(data.usuario) ? data.usuario : null;
      } catch {
        return null;
      }
    })().finally(() => {
      restauracaoEmAndamento = null;
    });
  }

  return restauracaoEmAndamento;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregarSessao() {
      const perfil = await restaurarSessao();

      if (!ativo) return;

      setUsuario(perfil);
      setCarregandoSessao(false);
    }

    void carregarSessao();

    return () => {
      ativo = false;
    };
  }, []);

  async function login(dados: LogarUsuarioData): Promise<Usuario> {
    const perfil = await usuarioService.login(dados);
    setUsuario(perfil);
    return perfil;
  }

  function atualizarUsuario(usuarioAtualizado: Usuario) {
    setUsuario(usuarioAtualizado);
  }

  async function logout(): Promise<void> {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Não foi possível encerrar a sessão.');
      }
    } finally {
      setUsuario(null);
    }
  }
  return (
    <AuthContext.Provider
      value={{
        usuario,
        autenticado: usuario !== null,
        carregandoSessao,
        login,
        atualizarUsuario,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider.');
  }
  return context;
}
