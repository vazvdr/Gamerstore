export interface SessionTokens {
  access_token: string;
  refresh_token: string;
}

export interface SessionUsuario {
  id: string;
  nome: string;
  email: string;
  admin?: boolean;
}

export interface SessionRefreshResponse extends SessionTokens, SessionUsuario {}

export type SessionRefreshResult =
  | {
      status: 'success';
      tokens: SessionTokens;
      usuario: SessionUsuario;
    }
  | {
      status: 'invalid';
    }
  | {
      status: 'unavailable';
      message: string;
      httpStatus?: number;
    };
