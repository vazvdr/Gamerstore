import { api, authApi } from '@/data/api/api';
import {
  Usuario, CadastrarUsuarioData, LogarUsuarioData, EditarUsuarioData,
  DeletarUsuarioData
} from '../types/usuario/usuario.type';

export const usuarioService = {
  async cadastrar(dados: CadastrarUsuarioData): Promise<Usuario> {
    const { data } = await api.post<Usuario>('/usuarios/cadastro', dados);
    return data;
  },
  async login(dados: LogarUsuarioData): Promise<Usuario> {
    const { data } = await authApi.post<Usuario>('/login', dados);
    return data;
  },
  async editar(dados: EditarUsuarioData): Promise<Usuario> {
    const { data } = await api.patch<Usuario>('/usuarios/editar', dados);
    return data;
  },
  async deletar(dados: DeletarUsuarioData): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>('/usuarios', { data: dados });
    return data;
  },
};
