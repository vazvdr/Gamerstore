
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsuarioServiceService } from '../../../../adapters/entrada/http/usuario-service.service';
import { CadastrarUsuarioUseCase } from '../../../../application/usecases/usuarios/cadastrar-usuario.usecase';
import { LogarUsuarioUseCase } from '../../../../application/usecases/usuarios/logar-usuario.usecase';
import { RefreshUsuarioUseCase } from '../../../../application/usecases/usuarios/usuario-refresh.usecase';
import { EditarUsuarioUseCase } from '../../../../application/usecases/usuarios/editar-usuario.usecase';
import { DeletarUsuarioUseCase } from '../../../../application/usecases/usuarios/deletar-usuario.usecase';
import { RecuperarSenhaUseCase } from '../../../../application/usecases/usuarios/recuperar-senha.usecase';
import { RedefinirSenhaUseCase } from '../../../../application/usecases/usuarios/redefinir-senha.usecase';
import { CadastrarEnderecoUseCase } from '../../../../application/usecases/enderecos/cadastrar-endereco.usecase';
import { EditarEnderecoUseCase } from '../../../../application/usecases/enderecos/editar-endereco.usecase';
import { DeletarEnderecoUseCase } from '../../../../application/usecases/enderecos/deletar-endereco.usecase';
import { ListarEnderecosUseCase } from '../../../../application/usecases/enderecos/listar-enderecos.usecase';

describe('UsuarioServiceService', () => {
  let service: UsuarioServiceService;

  const usecases = {
    cadastrarUsuario: { execute: vi.fn() },
    logarUsuario: { execute: vi.fn() },
    refreshUsuario: { execute: vi.fn() },
    editarUsuario: { execute: vi.fn() },
    deletarUsuario: { execute: vi.fn() },
    recuperarSenhaUsuario: { execute: vi.fn() },
    redefinirSenhaUsuario: { execute: vi.fn() },
    cadastrarEndereco: { execute: vi.fn() },
    editarEndereco: { execute: vi.fn() },
    deletarEndereco: { execute: vi.fn() },
    listarEnderecos: { execute: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    service = new UsuarioServiceService(
      usecases.cadastrarUsuario as unknown as CadastrarUsuarioUseCase,
      usecases.logarUsuario as unknown as LogarUsuarioUseCase,
      usecases.refreshUsuario as unknown as RefreshUsuarioUseCase,
      usecases.editarUsuario as unknown as EditarUsuarioUseCase,
      usecases.deletarUsuario as unknown as DeletarUsuarioUseCase,
      usecases.recuperarSenhaUsuario as unknown as RecuperarSenhaUseCase,
      usecases.redefinirSenhaUsuario as unknown as RedefinirSenhaUseCase,
      usecases.cadastrarEndereco as unknown as CadastrarEnderecoUseCase,
      usecases.editarEndereco as unknown as EditarEnderecoUseCase,
      usecases.deletarEndereco as unknown as DeletarEnderecoUseCase,
      usecases.listarEnderecos as unknown as ListarEnderecosUseCase,
    );
  });

  it('deve encaminhar os dados para CadastrarUsuarioUseCase', () => {
    const dto = { nome: 'Joazinho' };
    const resultado = { id: 'usuario-1' };

    usecases.cadastrarUsuario.execute.mockReturnValue(resultado);

    expect(service.cadastrar(dto as never)).toBe(resultado);
    expect(usecases.cadastrarUsuario.execute).toHaveBeenCalledWith(dto);
  });

  it('deve encaminhar os dados e o IP para LogarUsuarioUseCase', () => {
    const dto = { email: 'joazinho@email.com', senha: '123456' };
    const resultado = { accessToken: 'access-token' };

    usecases.logarUsuario.execute.mockReturnValue(resultado);

    expect(service.login(dto as never, '127.0.0.1')).toBe(resultado);
    expect(usecases.logarUsuario.execute).toHaveBeenCalledWith(
      dto,
      '127.0.0.1',
    );
  });

  it('deve encaminhar os dados para RefreshUsuarioUseCase', () => {
    const dto = { refreshToken: 'refresh-token' };
    const resultado = { accessToken: 'novo-token' };

    usecases.refreshUsuario.execute.mockReturnValue(resultado);

    expect(service.refresh(dto as never)).toBe(resultado);
    expect(usecases.refreshUsuario.execute).toHaveBeenCalledWith(dto);
  });

  it('deve encaminhar os dados para EditarUsuarioUseCase', () => {
    const dto = { id: 'usuario-1', nome: 'Joazinho atualizado' };
    const resultado = { id: 'usuario-1' };

    usecases.editarUsuario.execute.mockReturnValue(resultado);

    expect(service.editar(dto as never)).toBe(resultado);
    expect(usecases.editarUsuario.execute).toHaveBeenCalledWith(dto);
  });

  it('deve encaminhar os dados para DeletarUsuarioUseCase', () => {
    const dto = { id: 'usuario-1', senha: '123456' };
    const resultado = { sucesso: true };

    usecases.deletarUsuario.execute.mockReturnValue(resultado);

    expect(service.deletar(dto as never)).toBe(resultado);
    expect(usecases.deletarUsuario.execute).toHaveBeenCalledWith(dto);
  });

  it('deve encaminhar os dados para RecuperarSenhaUseCase', () => {
    const dto = { email: 'joazinho@email.com' };
    const resultado = { sucesso: true };

    usecases.recuperarSenhaUsuario.execute.mockReturnValue(resultado);

    expect(service.recuperarSenha(dto as never)).toBe(resultado);
    expect(
      usecases.recuperarSenhaUsuario.execute,
    ).toHaveBeenCalledWith(dto);
  });

  it('deve encaminhar os dados para RedefinirSenhaUseCase', () => {
    const dto = { token: 'token-recuperacao', senha: 'nova-senha' };
    const resultado = { sucesso: true };

    usecases.redefinirSenhaUsuario.execute.mockReturnValue(resultado);

    expect(service.redefinirSenha(dto as never)).toBe(resultado);
    expect(
      usecases.redefinirSenhaUsuario.execute,
    ).toHaveBeenCalledWith(dto);
  });

  it('deve encaminhar os dados para CadastrarEnderecoUseCase', () => {
    const dto = { user_id: 'usuario-1', rua: 'Rua das Flores' };
    const resultado = { id: 'endereco-1' };

    usecases.cadastrarEndereco.execute.mockReturnValue(resultado);

    expect(service.cadastrarEndereco(dto as never)).toBe(resultado);
    expect(usecases.cadastrarEndereco.execute).toHaveBeenCalledWith(dto);
  });

  it('deve encaminhar os dados para EditarEnderecoUseCase', () => {
    const dto = { id: 'endereco-1', user_id: 'usuario-1' };
    const resultado = { id: 'endereco-1' };

    usecases.editarEndereco.execute.mockReturnValue(resultado);

    expect(service.editarEndereco(dto as never)).toBe(resultado);
    expect(usecases.editarEndereco.execute).toHaveBeenCalledWith(dto);
  });

  it('deve encaminhar os dados para DeletarEnderecoUseCase', () => {
    const dto = { id: 'endereco-1', user_id: 'usuario-1' };
    const resultado = { sucesso: true };

    usecases.deletarEndereco.execute.mockReturnValue(resultado);

    expect(service.deletarEndereco(dto as never)).toBe(resultado);
    expect(usecases.deletarEndereco.execute).toHaveBeenCalledWith(dto);
  });

  it('deve encaminhar os dados para ListarEnderecosUseCase', () => {
    const dto = { user_id: 'usuario-1' };
    const resultado = [{ id: 'endereco-1' }];

    usecases.listarEnderecos.execute.mockReturnValue(resultado);

    expect(service.listarEnderecos(dto as never)).toBe(resultado);
    expect(usecases.listarEnderecos.execute).toHaveBeenCalledWith(dto);
  });
});
