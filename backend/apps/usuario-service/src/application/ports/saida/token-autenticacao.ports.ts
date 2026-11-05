export const TOKEN_AUTENTICACAO = Symbol('TOKEN_AUTENTICACAO');

export interface DadosTokenUsuario {
  sub: string;
  email: string;
}

export interface DadosRefreshToken extends DadosTokenUsuario {
  type: 'refresh';
  jti: string;
}

export interface TokenAutenticacaoPorta {
  gerarAccessToken(dados: DadosTokenUsuario): Promise<string>;
  gerarRefreshToken(dados: DadosTokenUsuario): Promise<string>;
  verificarRefreshToken(token: string): Promise<DadosRefreshToken | null>;
}