import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { EstadoBrasileiro, identificarEstadoPorCep } from '../../domain/entities/estado-cep';
import { TABELA_FRETE_PORT, TabelaFretePort } from '../ports/saida/tabela-frete.port';

export interface CalcularFreteResultado {
  cepDestino: string;
  estadoDestino: EstadoBrasileiro;
  valorFrete: number;
  moeda: 'BRL';
}

@Injectable()
export class CalcularFreteUseCase {
  constructor(
    @Inject(TABELA_FRETE_PORT)
    private readonly tabelaFrete: TabelaFretePort,
  ) {}

  executar(cepDestino: string): CalcularFreteResultado {
    const estado = identificarEstadoPorCep(cepDestino);

    if (!estado) {
      throw new BadRequestException('CEP de destino inválido ou não reconhecido.');
    }

    return {
      cepDestino: cepDestino.replace(/\D/g, ''),
      estadoDestino: estado,
      valorFrete: this.tabelaFrete.consultarValor(estado),
      moeda: 'BRL',
    };
  }
}
