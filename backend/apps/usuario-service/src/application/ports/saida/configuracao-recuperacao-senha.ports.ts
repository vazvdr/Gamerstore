export const CONFIGURACAO_RECUPERACAO_SENHA = Symbol('CONFIGURACAO_RECUPERACAO_SENHA');

export interface ConfiguracaoRecuperacaoSenhaPorta {
  obterTtl(): number;
  obterUrlFrontend(): string;
}