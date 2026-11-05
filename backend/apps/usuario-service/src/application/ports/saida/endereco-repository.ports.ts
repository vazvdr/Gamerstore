import type { Endereco } from '../../../domain/entities/endereco';

export const ENDERECO_REPOSITORIO = Symbol('ENDERECO_REPOSITORIO');

export interface CriarEnderecoDados {
  bairro: string;
  cep: string;
  cidade: string;
  complemento?: string;
  estado: string;
  numero: string;
  rua: string;
  user_id: string;
  principal?: boolean;
}

export interface AtualizarEnderecoDados {
  bairro?: string;
  cep?: string;
  cidade?: string;
  complemento?: string | null;
  estado?: string;
  numero?: string;
  rua?: string;
  principal?: boolean;
}

export interface EnderecoRepositorioPorta {
  criar(data: CriarEnderecoDados): Promise<Endereco>;
  buscarPorId(id: string, user_id: string): Promise<Endereco | null>;
  listarPorUsuario(user_id: string): Promise<Endereco[]>;
  atualizar(id: string, user_id: string, data: AtualizarEnderecoDados): Promise<{ count: number }>;
  definirPrincipal(id: string, user_id: string): Promise<Endereco>;
  deletar(id: string, user_id: string): Promise<{ count: number }>;
}