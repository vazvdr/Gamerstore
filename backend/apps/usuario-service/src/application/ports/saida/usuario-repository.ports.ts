import type { Usuario } from '../../../domain/entities/usuario';

export const USUARIO_REPOSITORIO = Symbol('USUARIO_REPOSITORIO');

export interface CriarUsuarioDados {
  nome: string;
  email: string;
  senha: string;
}

export interface AtualizarUsuarioDados {
  nome?: string;
  email?: string;
  senha?: string;
}

export interface UsuarioRepositorioPorta {
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
  criar(data: CriarUsuarioDados): Promise<Usuario>;
  atualizar(id: string, data: AtualizarUsuarioDados): Promise<Usuario>;
  deletarPorId(id: string): Promise<Usuario>;
}