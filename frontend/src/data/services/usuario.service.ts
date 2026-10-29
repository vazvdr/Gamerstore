import { api, authApi } from '@/data/api/api';

export interface CadastrarUsuarioData {
  nome: string;
  email: string;
  senha: string;
}
export interface LogarUsuarioData {
  email: string;
  senha: string;
}
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  admin?: boolean;
}
export const usuarioService = {
  async cadastrar(dados: CadastrarUsuarioData): Promise<Usuario> {
    const { data } = await api.post<Usuario>('/usuarios/cadastro', dados);
    return data;
  },
  async login(dados: LogarUsuarioData): Promise<Usuario> {
    const { data } = await authApi.post<Usuario>('/api/login', dados);
    return data;
  },
};
