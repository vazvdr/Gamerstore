
import { CadastrarEnderecoDto } from '../../../adapters/entrada/http/dto/endereco/cadastrar-endereco.dto';
import { EditarEnderecoDto } from '../../../adapters/entrada/http/dto/endereco/editar-endereco.dto';
import { DeletarEnderecoDto } from '../../../adapters/entrada/http/dto/endereco/deletar-endereco.dto';

export abstract class EnderecosGatewayPort {
  abstract cadastrarEndereco(
    body: CadastrarEnderecoDto,
    userId: string,
  ): Promise<unknown>;

  abstract listarEnderecos(userId: string): Promise<unknown>;

  abstract editarEndereco(
    id: string,
    body: EditarEnderecoDto,
    userId: string,
  ): Promise<unknown>;

  abstract deletarEndereco(
    body: DeletarEnderecoDto,
    userId: string,
  ): Promise<unknown>;
}
