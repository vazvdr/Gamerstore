export const NOTIFICACAO_RECUPERACAO_SENHA = Symbol('NOTIFICACAO_RECUPERACAO_SENHA');

export interface NotificacaoRecuperacaoSenhaPorta {
  enviar(dados: {
    usuarioId: string;
    nome: string;
    email: string;
    link: string;
  }): Promise<void>;
}