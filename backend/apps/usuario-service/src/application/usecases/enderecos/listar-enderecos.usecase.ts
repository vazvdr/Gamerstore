import { Inject, Injectable } from '@nestjs/common';
import { ENDERECO_REPOSITORIO, EnderecoRepositorioPorta } from '../../ports/saida/endereco-repository.ports';
import { ListarEnderecosInput } from '../../../adapters/entrada/http/dto/endereco/listar-enderecos.dto';

@Injectable()
export class ListarEnderecosUseCase {
  constructor(
    @Inject(ENDERECO_REPOSITORIO)
    private readonly enderecos: EnderecoRepositorioPorta,
  ) {}

  execute(dto: ListarEnderecosInput) {
    return this.enderecos.listarPorUsuario(dto.user_id);
  }
}
