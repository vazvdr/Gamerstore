export const SESSAO_USUARIO = Symbol('SESSAO_USUARIO');

export interface SessaoUsuarioPorta {
  registrarRefreshToken(token: string, usuarioId: string): Promise<boolean>;
  rotacionarRefreshToken(tokenAtual: string, novoToken: string, usuarioId: string): Promise<number>;
}