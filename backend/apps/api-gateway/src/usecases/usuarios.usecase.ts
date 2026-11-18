import { Injectable } from '@nestjs/common';
import { UsuariosGatewayPort } from '../application/ports/saida/usuarios-gateway.ports';

@Injectable()
export class UsuariosUseCase {
  constructor(
    private readonly usuariosGateway: UsuariosGatewayPort,
  ) {}

  async cadastrarUsuario(body: unknown) {
    return this.usuariosGateway.cadastrarUsuario(body);
  }
  async loginUsuario(body: unknown) {
    return this.usuariosGateway.loginUsuario(body);
  }
  async refreshUsuario(body: unknown) {
    return this.usuariosGateway.refreshUsuario(body);
  }
  async editarUsuario(body: unknown, userId: string) {
    return this.usuariosGateway.editarUsuario(body, userId);
  }
  async deletarUsuario(body: unknown, userId: string) {
    return this.usuariosGateway.deletarUsuario(body, userId);
  }
  async recuperarSenha(body: { email: string }) {
    return this.usuariosGateway.recuperarSenha(body);
  }
  async redefinirSenha(body: { token: string; senha: string }) {
    return this.usuariosGateway.redefinirSenha(body);
  }
}
