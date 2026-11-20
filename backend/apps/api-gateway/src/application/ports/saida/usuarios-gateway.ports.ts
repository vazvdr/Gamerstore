import { CadastrarUsuarioDto } from '../../../adapters/entrada/http/dto/usuarios/cadastrar-usuario.dto';
import { LogarUsuarioDto } from '../../../adapters/entrada/http/dto/usuarios/logar-usuario.dto';
import { RefreshTokenDto } from '../../../adapters/entrada/http/dto/usuarios/refresh-token.dto';
import { EditarUsuarioDto } from '../../../adapters/entrada/http/dto/usuarios/editar-usuario.dto';
import { DeletarUsuarioDto } from '../../../adapters/entrada/http/dto/usuarios/deletar-usuario.dto';
import { RecuperarSenhaDto } from '../../../adapters/entrada/http/dto/usuarios/recuperar-senha.dto';
import { RedefinirSenhaDto } from '../../../adapters/entrada/http/dto/usuarios/redefinir-senha.dto';

export abstract class UsuariosGatewayPort {
  abstract cadastrarUsuario(body: CadastrarUsuarioDto): Promise<unknown>;
  abstract loginUsuario(body: LogarUsuarioDto): Promise<unknown>;
  abstract refreshUsuario(body: RefreshTokenDto): Promise<unknown>;
  abstract editarUsuario(body: EditarUsuarioDto, userId: string): Promise<unknown>;
  abstract deletarUsuario(body: DeletarUsuarioDto, userId: string): Promise<unknown>;
  abstract recuperarSenha(body: RecuperarSenhaDto): Promise<unknown>;
  abstract redefinirSenha(body: RedefinirSenhaDto): Promise<unknown>;
}
