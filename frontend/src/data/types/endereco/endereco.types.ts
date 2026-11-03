export interface Endereco {
  id: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento: string | null;
  principal: boolean;
}

export type CadastrarEnderecoData = Omit<Endereco, 'id'>;
export type EditarEnderecoData = Partial<CadastrarEnderecoData>;
export interface DeletarEnderecoData {
  id: string;
}