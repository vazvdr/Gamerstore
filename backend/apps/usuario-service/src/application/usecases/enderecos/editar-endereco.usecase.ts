import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ENDERECO_REPOSITORIO, EnderecoRepositorioPorta } from '../../ports/saida/endereco-repository.ports';
import { EditarEnderecoInput } from '../../../adapters/entrada/http/dto/endereco/editar-endereco.dto';

@Injectable()
export class EditarEnderecoUseCase {
  constructor(
    @Inject(ENDERECO_REPOSITORIO)
    private readonly enderecos: EnderecoRepositorioPorta,
  ) {}

  async execute(dto: EditarEnderecoInput) {
    const endereco = await this.enderecos.buscarPorId(dto.id, dto.user_id);
    if (!endereco) {
      throw new NotFoundException('Endereço não encontrado.');
    }
    const data = {
      ...(dto.bairro !== undefined && { bairro: dto.bairro.trim() }),
      ...(dto.cep !== undefined && { cep: dto.cep }),
      ...(dto.cidade !== undefined && { cidade: dto.cidade.trim() }),
      ...(dto.complemento !== undefined && { complemento: dto.complemento?.trim() || null }),
      ...(dto.estado !== undefined && { estado: dto.estado.toUpperCase() }),
      ...(dto.numero !== undefined && { numero: dto.numero.trim() }),
      ...(dto.rua !== undefined && { rua: dto.rua.trim() }),
    };
    if (Object.keys(data).length === 0 && dto.principal === undefined) {
      throw new BadRequestException('Nenhum dado foi informado para alteração.');
    }
    if (Object.keys(data).length > 0) {
      await this.enderecos.atualizar(dto.id, dto.user_id, data);
    }
    if (dto.principal === true) {
      return this.enderecos.definirPrincipal(dto.id, dto.user_id);
    }
    if (dto.principal === false && endereco.principal) {
      await this.enderecos.atualizar(dto.id, dto.user_id, { principal: false });
    }
    return this.enderecos.buscarPorId(dto.id, dto.user_id);
  }
}
