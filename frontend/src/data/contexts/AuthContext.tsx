'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usuarioService, type LogarUsuarioData, type Usuario } from '@/data/services/usuario.service';

interface AuthContextData {
  usuario: Usuario | null;
  autenticado: boolean;
  carregandoSessao: boolean;
  login: (dados: LogarUsuarioData) => Promise<Usuario>;
  atualizarUsuario: (usuario: Usuario) => void;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  useEffect(() => {
    let ativo = true;
    async function restaurarSessao() {
      try {
        const response = await fetch('/api/session', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        if (ativo && data.usuario) {
          setUsuario(data.usuario);
        }
      } catch {
        if (ativo) setUsuario(null);
      } finally {
        if (ativo) setCarregandoSessao(false);
      }
    }
    void restaurarSessao();
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
  async function logout() {
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
  if (!context) { throw new Error('useAuth deve ser utilizado dentro de AuthProvider.')};
  return context;
}
