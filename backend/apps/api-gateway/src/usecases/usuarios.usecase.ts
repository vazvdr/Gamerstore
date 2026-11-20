import { Injectable } from '@nestjs/common';
import { UsuariosGatewayPort } from '../application/ports/saida/usuarios-gateway.ports';
import { CadastrarUsuarioDto } from '../adapters/entrada/http/dto/usuarios/cadastrar-usuario.dto';
import { LogarUsuarioDto } from '../adapters/entrada/http/dto/usuarios/logar-usuario.dto';
import { RefreshTokenDto } from '../adapters/entrada/http/dto/usuarios/refresh-token.dto';
import { EditarUsuarioDto } from '../adapters/entrada/http/dto/usuarios/editar-usuario.dto';
import { DeletarUsuarioDto } from '../adapters/entrada/http/dto/usuarios/deletar-usuario.dto';
import { RecuperarSenhaDto } from '../adapters/entrada/http/dto/usuarios/recuperar-senha.dto';
import { RedefinirSenhaDto } from '../adapters/entrada/http/dto/usuarios/redefinir-senha.dto';

@Injectable()
export class UsuariosUseCase {
  constructor(
    private readonly usuariosGateway: UsuariosGatewayPort,
  ) {}

  async cadastrarUsuario(body: CadastrarUsuarioDto) {
    return this.usuariosGateway.cadastrarUsuario(body);
  }

  async loginUsuario(body: LogarUsuarioDto) {
    return this.usuariosGateway.loginUsuario(body);
  }

  async refreshUsuario(body: RefreshTokenDto) {
    return this.usuariosGateway.refreshUsuario(body);
  }

  async editarUsuario(body: EditarUsuarioDto, userId: string) {
    return this.usuariosGateway.editarUsuario(body, userId);
  }

  async deletarUsuario(body: DeletarUsuarioDto, userId: string) {
    return this.usuariosGateway.deletarUsuario(body, userId);
  }

  async recuperarSenha(body: RecuperarSenhaDto) {
    return this.usuariosGateway.recuperarSenha(body);
  }

  async redefinirSenha(body: RedefinirSenhaDto) {
    return this.usuariosGateway.redefinirSenha(body);
  }
}
