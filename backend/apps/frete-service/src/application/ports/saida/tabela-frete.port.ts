import { EstadoBrasileiro } from '../../../domain/entities/estado-cep';

export interface TabelaFretePort {
  consultarValor(estado: EstadoBrasileiro): number;
}

export const TABELA_FRETE_PORT = Symbol('TABELA_FRETE_PORT');
