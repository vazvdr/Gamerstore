import { Injectable } from '@nestjs/common';
import { EstadoBrasileiro } from '../../domain/entities/estado-cep';
import { VALORES_FRETE } from '../../domain/entities/valores-frete';
import { TabelaFretePort } from '../../application/ports/saida/tabela-frete.port';

@Injectable()
export class TabelaFreteAdapter implements TabelaFretePort {
  consultarValor(estado: EstadoBrasileiro): number {
    return VALORES_FRETE[estado];
  }
}
