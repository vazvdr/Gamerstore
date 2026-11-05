export const TENTATIVA_LOGIN = Symbol('TENTATIVA_LOGIN');

export interface ResultadoTentativaLogin {
  bloqueado: boolean;
  tentativas: number;
  tempoRestante: number;
}

export interface TentativaLoginPorta {
  consultarBloqueio(ip: string): Promise<number>;
  registrarFalha(
    ip: string,
    limite: number,
    tempoBloqueio: number,
  ): Promise<ResultadoTentativaLogin>;
  limparTentativas(ip: string): Promise<void>;
}
