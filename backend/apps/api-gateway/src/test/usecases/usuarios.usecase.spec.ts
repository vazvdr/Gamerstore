
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsuariosUseCase } from '../../usecases/usuarios.usecase';
import { UsuariosGatewayPort } from '../../application/ports/saida/usuarios-gateway.ports';
import { CadastrarUsuarioDto } from '../../adapters/entrada/http/dto/usuarios/cadastrar-usuario.dto';
import { LogarUsuarioDto } from '../../adapters/entrada/http/dto/usuarios/logar-usuario.dto';
import { RefreshTokenDto } from '../../adapters/entrada/http/dto/usuarios/refresh-token.dto';
import { EditarUsuarioDto } from '../../adapters/entrada/http/dto/usuarios/editar-usuario.dto';
import { DeletarUsuarioDto } from '../../adapters/entrada/http/dto/usuarios/deletar-usuario.dto';
import { RecuperarSenhaDto } from '../../adapters/entrada/http/dto/usuarios/recuperar-senha.dto';
import { RedefinirSenhaDto } from '../../adapters/entrada/http/dto/usuarios/redefinir-senha.dto';

describe('UsuariosUseCase', () => {
  let useCase: UsuariosUseCase;
  let usuariosGateway: UsuariosGatewayPort;

  beforeEach(() => {
    usuariosGateway = {
      cadastrarUsuario: vi.fn().mockResolvedValue({ id: 'user-1' }),
      loginUsuario: vi.fn().mockResolvedValue({ accessToken: 'token' }),
      refreshUsuario: vi.fn().mockResolvedValue({ accessToken: 'new-token' }),
      editarUsuario: vi.fn().mockResolvedValue({ sucesso: true }),
      deletarUsuario: vi.fn().mockResolvedValue({ sucesso: true }),
      recuperarSenha: vi.fn().mockResolvedValue({ sucesso: true }),
      redefinirSenha: vi.fn().mockResolvedValue({ sucesso: true }),
    };

    useCase = new UsuariosUseCase(usuariosGateway);
  });

  it('deve cadastrar um usuário', async () => {
    const body = { nome: 'Joazinho', email: 'joazinho@example.com', senha: 'Senha123!' } as CadastrarUsuarioDto;

    await expect(useCase.cadastrarUsuario(body)).resolves.toEqual({ id: 'user-1' });
    expect(usuariosGateway.cadastrarUsuario).toHaveBeenCalledWith(body);
  });

  it('deve autenticar um usuário', async () => {
    const body = { email: 'joazinho@example.com', senha: 'Senha123!' } as LogarUsuarioDto;

    await expect(useCase.loginUsuario(body)).resolves.toEqual({ accessToken: 'token' });
    expect(usuariosGateway.loginUsuario).toHaveBeenCalledWith(body);
  });

  it('deve renovar a sessão do usuário', async () => {
    const body = { refreshToken: 'refresh-token' } as RefreshTokenDto;

    await expect(useCase.refreshUsuario(body)).resolves.toEqual({ accessToken: 'new-token' });
    expect(usuariosGateway.refreshUsuario).toHaveBeenCalledWith(body);
  });

  it('deve editar os dados do usuário', async () => {
    const body = { nome: 'Joazinho Atualizado' } as EditarUsuarioDto;
    const userId = 'user-1';

    await expect(useCase.editarUsuario(body, userId)).resolves.toEqual({ sucesso: true });
    expect(usuariosGateway.editarUsuario).toHaveBeenCalledWith(body, userId);
  });

  it('deve excluir um usuário', async () => {
    const body = {} as DeletarUsuarioDto;
    const userId = 'user-1';

    await expect(useCase.deletarUsuario(body, userId)).resolves.toEqual({ sucesso: true });
    expect(usuariosGateway.deletarUsuario).toHaveBeenCalledWith(body, userId);
  });

  it('deve solicitar recuperação de senha', async () => {
    const body = { email: 'joazinho@example.com' } as RecuperarSenhaDto;

    await expect(useCase.recuperarSenha(body)).resolves.toEqual({ sucesso: true });
    expect(usuariosGateway.recuperarSenha).toHaveBeenCalledWith(body);
  });

  it('deve redefinir a senha', async () => {
    const body = { token: 'recovery-token', senha: 'NovaSenha123!' } as RedefinirSenhaDto;

    await expect(useCase.redefinirSenha(body)).resolves.toEqual({ sucesso: true });
    expect(usuariosGateway.redefinirSenha).toHaveBeenCalledWith(body);
  });

  it('deve propagar erros lançados pelo gateway', async () => {
    const error = new Error('Falha na operação');
    vi.mocked(usuariosGateway.cadastrarUsuario).mockRejectedValue(error);

    await expect(
      useCase.cadastrarUsuario({} as CadastrarUsuarioDto),
    ).rejects.toBe(error);
  });
});
