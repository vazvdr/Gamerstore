export interface CadastrarUsuarioData {
  nome: string;
  email: string;
  senha: string;
}
export interface LogarUsuarioData {
  email: string;
  senha: string;
}
export interface EditarUsuarioData {
  senhaAtual: string;
  nome?: string;
  email?: string;
  novaSenha?: string;
}
export interface DeletarUsuarioData {
  senhaAtual: string;
}
export interface Usuario {
  id: string;
  nome: string;
  email: string;
}