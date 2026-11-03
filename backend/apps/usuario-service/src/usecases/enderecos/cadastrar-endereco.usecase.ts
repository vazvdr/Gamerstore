
import { Injectable } from '@nestjs/common';
import { CadastrarEnderecoInput } from '../../dto/endereco/cadastrar-endereco.dto';
import { EnderecoRepository } from '../../users/endereco/endereco.repository';

@Injectable()
export class CadastrarEnderecoUseCase {
  constructor(private readonly enderecos: EnderecoRepository) {}

  execute(dto: CadastrarEnderecoInput) {
    return this.enderecos.criar({
      bairro: dto.bairro.trim(),
      cep: dto.cep,
      cidade: dto.cidade.trim(),
      complemento: dto.complemento?.trim(),
      estado: dto.estado.toUpperCase(),
      numero: dto.numero.trim(),
      rua: dto.rua.trim(),
      user_id: dto.user_id,
      principal: dto.principal ?? false,
    });
  }
}
