
import { Injectable } from '@nestjs/common';
import { ListarEnderecosInput } from '../../dto/endereco/listar-enderecos.dto';
import { EnderecoRepository } from '../../users/endereco/endereco.repository';

@Injectable()
export class ListarEnderecosUseCase {
  constructor(private readonly enderecos: EnderecoRepository) {}

  execute(dto: ListarEnderecosInput) {
    return this.enderecos.listarPorUsuario(dto.user_id);
  }
}
