import { Injectable } from '@nestjs/common';
import { EnderecosGatewayPort } from '../application/ports/saida/enderecos-gateway.ports';
import { CadastrarEnderecoDto } from '../adapters/entrada/http/dto/endereco/cadastrar-endereco.dto';
import { EditarEnderecoDto } from '../adapters/entrada/http/dto/endereco/editar-endereco.dto';
import { DeletarEnderecoDto } from '../adapters/entrada/http/dto/endereco/deletar-endereco.dto';

@Injectable()
export class EnderecosUseCase {
  constructor(
    private readonly enderecosGateway: EnderecosGatewayPort,
  ) {}

  async cadastrarEndereco(body: CadastrarEnderecoDto, userId: string) {
    return this.enderecosGateway.cadastrarEndereco(body, userId);
  }
  async listarEnderecos(userId: string) {
    return this.enderecosGateway.listarEnderecos(userId);
  }
  async editarEndereco(id: string, body: EditarEnderecoDto, userId: string ) {
    return this.enderecosGateway.editarEndereco(id, body, userId);
  }
  async deletarEndereco(body: DeletarEnderecoDto, userId: string) {
    return this.enderecosGateway.deletarEndereco(body, userId);
  }
}
