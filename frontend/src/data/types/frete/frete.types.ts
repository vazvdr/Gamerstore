export interface CalcularFreteData {
  cepDestino: string;
}

export interface CalcularFreteResponse {
  cepDestino: string;
  estadoDestino: string;
  valorFrete: number;
  moeda: 'BRL';
}
