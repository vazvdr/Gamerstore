
export type EstadoBrasileiro =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF'
  | 'ES' | 'GO' | 'MA' | 'MT' | 'MS' | 'MG' | 'PA'
  | 'PB' | 'PR' | 'PE' | 'PI' | 'RJ' | 'RN' | 'RS'
  | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

interface FaixaCep {
  estado: EstadoBrasileiro;
  inicio: number;
  fim: number;
}

export const FAIXAS_CEP: FaixaCep[] = [
  { estado: 'SP', inicio: 1000, fim: 19999 },
  { estado: 'RJ', inicio: 20000, fim: 28999 },
  { estado: 'ES', inicio: 29000, fim: 29999 },
  { estado: 'MG', inicio: 30000, fim: 39999 },
  { estado: 'BA', inicio: 40000, fim: 48999 },
  { estado: 'SE', inicio: 49000, fim: 49999 },
  { estado: 'PE', inicio: 50000, fim: 56999 },
  { estado: 'AL', inicio: 57000, fim: 57999 },
  { estado: 'PB', inicio: 58000, fim: 58999 },
  { estado: 'RN', inicio: 59000, fim: 59999 },
  { estado: 'CE', inicio: 60000, fim: 63999 },
  { estado: 'PI', inicio: 64000, fim: 64999 },
  { estado: 'MA', inicio: 65000, fim: 65999 },
  { estado: 'PA', inicio: 66000, fim: 68899 },
  { estado: 'AP', inicio: 68900, fim: 68999 },
  { estado: 'AM', inicio: 69000, fim: 69299 },
  { estado: 'RR', inicio: 69300, fim: 69399 },
  { estado: 'AM', inicio: 69400, fim: 69899 },
  { estado: 'AC', inicio: 69900, fim: 69999 },
  { estado: 'DF', inicio: 70000, fim: 72799 },
  { estado: 'GO', inicio: 72800, fim: 72999 },
  { estado: 'DF', inicio: 73000, fim: 73699 },
  { estado: 'GO', inicio: 73700, fim: 76799 },
  { estado: 'RO', inicio: 76800, fim: 76999 },
  { estado: 'TO', inicio: 77000, fim: 77999 },
  { estado: 'MT', inicio: 78000, fim: 78899 },
  { estado: 'MS', inicio: 79000, fim: 79999 },
  { estado: 'PR', inicio: 80000, fim: 87999 },
  { estado: 'SC', inicio: 88000, fim: 89999 },
  { estado: 'RS', inicio: 90000, fim: 99999 },
];

export function identificarEstadoPorCep(cep: string): EstadoBrasileiro | null {
  const cepLimpo = cep.trim();

  if (!/^\d{5}-?\d{3}$/.test(cepLimpo)) return null;

  const prefixo = Number(cepLimpo.replace('-', '').slice(0, 5));
  const faixa = FAIXAS_CEP.find(({ inicio, fim }) => prefixo >= inicio && prefixo <= fim);

  return faixa?.estado ?? null;
}
