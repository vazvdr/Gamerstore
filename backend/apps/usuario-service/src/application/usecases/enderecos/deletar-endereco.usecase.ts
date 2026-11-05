import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ENDERECO_REPOSITORIO, EnderecoRepositorioPorta } from '../../ports/saida/endereco-repository.ports';
import { DeletarEnderecoInput } from '../../../adapters/entrada/http/dto/endereco/deletar-endereco.dto';

@Injectable()
export class DeletarEnderecoUseCase {
  constructor(
    @Inject(ENDERECO_REPOSITORIO)
    private readonly enderecos: EnderecoRepositorioPorta,
  ) {}

  async execute(dto: DeletarEnderecoInput) {
    const endereco = await this.enderecos.deletar(dto.id, dto.user_id);
    if (endereco.count === 0) {
      throw new NotFoundException('Endereço não encontrado.');
    }
    return { message: 'Endereço excluído com sucesso.' };
  }
}
