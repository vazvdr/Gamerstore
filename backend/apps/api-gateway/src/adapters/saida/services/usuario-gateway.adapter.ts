import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CadastrarUsuarioDto } from '../../entrada/http/dto/usuarios/cadastrar-usuario.dto';
import { LogarUsuarioDto } from '../../entrada/http/dto/usuarios/logar-usuario.dto';
import { RefreshTokenDto } from '../../entrada/http/dto/usuarios/refresh-token.dto';
import { EditarUsuarioDto } from '../../entrada/http/dto/usuarios/editar-usuario.dto';
import { DeletarUsuarioDto } from '../../entrada/http/dto/usuarios/deletar-usuario.dto';
import { RecuperarSenhaDto } from '../../entrada/http/dto/usuarios/recuperar-senha.dto';
import { RedefinirSenhaDto } from '../../entrada/http/dto/usuarios/redefinir-senha.dto';
import { UsuariosGatewayPort } from '../../../application/ports/saida/usuarios-gateway.ports';
import { HttpClientService } from '../http/clients/http-client.service';

@Injectable()
export class UsuariosGatewayAdapter implements UsuariosGatewayPort {
  private readonly serviceUrl: string;

  constructor(private readonly httpClient: HttpClientService, config: ConfigService) {
    this.serviceUrl = config.getOrThrow<string>('USUARIO_SERVICE_URL');
  }

  async cadastrarUsuario(body: CadastrarUsuarioDto) {
    return this.httpClient.request({
      method: 'POST',
      url: `${this.serviceUrl}/usuarios/cadastro`,
      data: body,
    }, 'Não foi possível cadastrar o usuário.');
  }

  async loginUsuario(body: LogarUsuarioDto) {
    return this.httpClient.request({
      method: 'POST',
      url: `${this.serviceUrl}/usuarios/login`,
      data: body,
    }, 'Não foi possível autenticar o usuário.');
  }

  async refreshUsuario(body: RefreshTokenDto) {
    return this.httpClient.request({
      method: 'POST',
      url: `${this.serviceUrl}/usuarios/refresh`,
      data: body,
    }, 'Não foi possível renovar a sessão.');
  }

  async editarUsuario(body: EditarUsuarioDto, userId: string) {
    return this.httpClient.request({
      method: 'PATCH',
      url: `${this.serviceUrl}/usuarios/editar`,
      data: body,
      headers: { 'x-authenticated-user-id': userId },
    }, 'Não foi possível atualizar os dados do usuário.');
  }

  async deletarUsuario(body: DeletarUsuarioDto, userId: string) {
    return this.httpClient.request({
      method: 'DELETE',
      url: `${this.serviceUrl}/usuarios`,
      data: body,
      headers: { 'x-authenticated-user-id': userId },
    }, 'Não foi possível excluir a conta do usuário.');
  }

  async recuperarSenha(body: RecuperarSenhaDto) {
    return this.httpClient.request({
      method: 'POST',
      url: `${this.serviceUrl}/usuarios/recuperar-senha`,
      data: body,
    }, 'Não foi possível processar a solicitação de recuperação de senha.');
  }

  async redefinirSenha(body: RedefinirSenhaDto) {
    return this.httpClient.request({
      method: 'POST',
      url: `${this.serviceUrl}/usuarios/redefinir-senha`,
      data: body,
    }, 'Não foi possível redefinir a senha.');
  }
}
