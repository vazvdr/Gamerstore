export const SENHA_CRIPTOGRAFIA = Symbol('SENHA_CRIPTOGRAFIA');

export interface SenhaCriptografiaPorta {
  hashSenha(senha: string): Promise<string>;
  verificarSenha(hash: string, senha: string): Promise<boolean>;
}