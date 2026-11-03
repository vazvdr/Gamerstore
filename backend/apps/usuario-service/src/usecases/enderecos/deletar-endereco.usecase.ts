import { Injectable, NotFoundException } from '@nestjs/common';
import { DeletarEnderecoInput } from '../../dto/endereco/deletar-endereco.dto';
import { EnderecoRepository } from '../../users/endereco/endereco.repository';

@Injectable()
export class DeletarEnderecoUseCase {
  constructor(private readonly enderecos: EnderecoRepository) {}

  async execute(dto: DeletarEnderecoInput) {
    const endereco = await this.enderecos.deletar(dto.id, dto.user_id);
    if (endereco.count === 0) {
      throw new NotFoundException('Endereço não encontrado.');
    }
    return { message: 'Endereço excluído com sucesso.' };
  }
}
