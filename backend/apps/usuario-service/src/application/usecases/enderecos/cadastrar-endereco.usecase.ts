import { Inject, Injectable } from '@nestjs/common';
import { ENDERECO_REPOSITORIO, EnderecoRepositorioPorta } from '../../ports/saida/endereco-repository.ports';
import { CadastrarEnderecoInput } from '../../../adapters/entrada/http/dto/endereco/cadastrar-endereco.dto';

@Injectable()
export class CadastrarEnderecoUseCase {
  constructor(
    @Inject(ENDERECO_REPOSITORIO)
    private readonly enderecos: EnderecoRepositorioPorta,
  ) { }

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
