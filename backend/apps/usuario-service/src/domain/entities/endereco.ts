export interface Endereco {
  id: string;
  bairro: string;
  cep: string;
  cidade: string;
  complemento: string | null;
  estado: string;
  numero: string;
  principal: boolean;
  rua: string;
  user_id: string;
}