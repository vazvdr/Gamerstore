import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsuariosGatewayAdapter } from '../../../../adapters/saida/services/usuario-gateway.adapter';
import { HttpClientService } from '../../../../adapters/saida/http/clients/http-client.service';
import { CadastrarUsuarioDto } from '../../../../adapters/entrada/http/dto/usuarios/cadastrar-usuario.dto';
import { LogarUsuarioDto } from '../../../../adapters/entrada/http/dto/usuarios/logar-usuario.dto';
import { RefreshTokenDto } from '../../../../adapters/entrada/http/dto/usuarios/refresh-token.dto';
import { EditarUsuarioDto } from '../../../../adapters/entrada/http/dto/usuarios/editar-usuario.dto';
import { DeletarUsuarioDto } from '../../../../adapters/entrada/http/dto/usuarios/deletar-usuario.dto';
import { RecuperarSenhaDto } from '../../../../adapters/entrada/http/dto/usuarios/recuperar-senha.dto';
import { RedefinirSenhaDto } from '../../../../adapters/entrada/http/dto/usuarios/redefinir-senha.dto';

describe('UsuariosGatewayAdapter', () => {
  let adapter: UsuariosGatewayAdapter;
  let httpClient: HttpClientService;
  let config: ConfigService;

  const serviceUrl = 'http://localhost:3002';
  const userId = 'user-123';

  beforeEach(() => {
    httpClient = {
      request: vi.fn().mockResolvedValue({ sucesso: true }),
    } as unknown as HttpClientService;

    config = {
      getOrThrow: vi.fn().mockReturnValue(serviceUrl),
    } as unknown as ConfigService;

    adapter = new UsuariosGatewayAdapter(httpClient, config);
  });

  it('deve configurar a URL do serviço de usuários', () => {
    expect(config.getOrThrow).toHaveBeenCalledWith('USUARIO_SERVICE_URL');
  });

  it('deve cadastrar um usuário', async () => {
    const body = {} as unknown as CadastrarUsuarioDto;

    await adapter.cadastrarUsuario(body);

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'POST',
        url: `${serviceUrl}/usuarios/cadastro`,
        data: body,
      },
      'Não foi possível cadastrar o usuário.',
    );
  });

  it('deve autenticar um usuário', async () => {
    const body = {} as unknown as LogarUsuarioDto;

    await adapter.loginUsuario(body);

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'POST',
        url: `${serviceUrl}/usuarios/login`,
        data: body,
      },
      'Não foi possível autenticar o usuário.',
    );
  });

  it('deve renovar a sessão do usuário', async () => {
    const body = {} as unknown as RefreshTokenDto;

    await adapter.refreshUsuario(body);

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'POST',
        url: `${serviceUrl}/usuarios/refresh`,
        data: body,
      },
      'Não foi possível renovar a sessão.',
    );
  });

  it('deve editar os dados do usuário', async () => {
    const body = {} as unknown as EditarUsuarioDto;

    await adapter.editarUsuario(body, userId);

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'PATCH',
        url: `${serviceUrl}/usuarios/editar`,
        data: body,
        headers: { 'x-authenticated-user-id': userId },
      },
      'Não foi possível atualizar os dados do usuário.',
    );
  });

  it('deve excluir a conta do usuário', async () => {
    const body = {} as unknown as DeletarUsuarioDto;

    await adapter.deletarUsuario(body, userId);

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'DELETE',
        url: `${serviceUrl}/usuarios`,
        data: body,
        headers: { 'x-authenticated-user-id': userId },
      },
      'Não foi possível excluir a conta do usuário.',
    );
  });

  it('deve solicitar a recuperação de senha', async () => {
    const body = { email: 'joazinho@example.com' } as RecuperarSenhaDto;

    await adapter.recuperarSenha(body);

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'POST',
        url: `${serviceUrl}/usuarios/recuperar-senha`,
        data: body,
      },
      'Não foi possível processar a solicitação de recuperação de senha.',
    );
  });

  it('deve redefinir a senha', async () => {
    const body = { token: 'recovery-token', senha: 'NovaSenha123!' } as RedefinirSenhaDto;

    await adapter.redefinirSenha(body);

    expect(httpClient.request).toHaveBeenCalledWith(
      {
        method: 'POST',
        url: `${serviceUrl}/usuarios/redefinir-senha`,
        data: body,
      },
      'Não foi possível redefinir a senha.',
    );
  });

  it('deve retornar a resposta do HttpClientService', async () => {
    const response = { id: 'user-123', nome: 'Joazinho' };
    vi.mocked(httpClient.request).mockResolvedValue(response);

    await expect(
      adapter.loginUsuario({} as unknown as LogarUsuarioDto),
    ).resolves.toEqual(response);
  });

  it('deve propagar erros do HttpClientService', async () => {
    const error = new Error('Falha na comunicação');
    vi.mocked(httpClient.request).mockRejectedValue(error);

    await expect(
      adapter.loginUsuario({} as unknown as LogarUsuarioDto),
    ).rejects.toBe(error);
  });
});
