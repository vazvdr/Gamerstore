export const TOKEN_RECUPERACAO_SENHA = Symbol('TOKEN_RECUPERACAO_SENHA');

export interface TokenRecuperacaoSenhaPorta {
  registrar(tokenHash: string, usuarioId: string, ttl: number): Promise<boolean>;
  buscar(tokenHash: string): Promise<string | null>;
  consumir(tokenHash: string, usuarioId: string): Promise<boolean>;
}