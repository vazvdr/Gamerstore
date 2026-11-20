
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DeletarUsuarioUseCase } from '../../../../application/usecases/usuarios/deletar-usuario.usecase';
import type { UsuarioRepositorioPorta } from '../../../../application/ports/saida/usuario-repository.ports';
import type { SenhaCriptografiaPorta } from '../../../../application/ports/saida/senha-criptografia.ports';
import type { Usuario } from '../../../../domain/entities/usuario';
import type { DeletarUsuarioInput } from '../../../../adapters/entrada/http/dto/usuario/deletar-usuario.dto';

describe('DeletarUsuarioUseCase', () => {
  let useCase: DeletarUsuarioUseCase;
  let users: UsuarioRepositorioPorta;
  let security: SenhaCriptografiaPorta;

  const dto: DeletarUsuarioInput = {
    id: 'usuario-1',
    senhaAtual: 'senha-atual',
  };

  const usuario: Usuario = {
    id: 'usuario-1',
    admin: false,
    nome: 'Joazinho',
    email: 'teste@email.com',
    senha: 'senha-hash',
  };

  beforeEach(() => {
    users = {
      buscarPorEmail: vi.fn(),
      buscarPorId: vi.fn().mockResolvedValue(usuario),
      criar: vi.fn(),
      atualizar: vi.fn(),
      deletarPorId: vi.fn().mockResolvedValue(usuario),
    };

    security = {
      hashSenha: vi.fn(),
      verificarSenha: vi.fn().mockResolvedValue(true),
    };

    useCase = new DeletarUsuarioUseCase(users, security);
  });

  it('deve excluir a conta quando a senha atual for válida', async () => {
    const resultado = await useCase.execute(dto);

    expect(users.buscarPorId).toHaveBeenCalledWith(dto.id);
    expect(security.verificarSenha).toHaveBeenCalledWith(usuario.senha, dto.senhaAtual);
    expect(users.deletarPorId).toHaveBeenCalledWith(dto.id);
    expect(resultado).toEqual({
      message: 'Conta excluída com sucesso.',
    });
  });

  it('deve lançar NotFoundException quando o usuário não existir', async () => {
    vi.mocked(users.buscarPorId).mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(
      new NotFoundException('Usuário não encontrado.'),
    );

    expect(security.verificarSenha).not.toHaveBeenCalled();
    expect(users.deletarPorId).not.toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException quando a senha atual for inválida', async () => {
    vi.mocked(security.verificarSenha).mockResolvedValue(false);

    await expect(useCase.execute(dto)).rejects.toThrow(
      new UnauthorizedException('Senha atual inválida.'),
    );

    expect(users.buscarPorId).toHaveBeenCalledWith(dto.id);
    expect(security.verificarSenha).toHaveBeenCalledWith(usuario.senha, dto.senhaAtual);
    expect(users.deletarPorId).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao buscar o usuário', async () => {
    const erro = new Error('Erro ao buscar usuário');
    vi.mocked(users.buscarPorId).mockRejectedValue(erro);

    await expect(useCase.execute(dto)).rejects.toThrow(erro);

    expect(security.verificarSenha).not.toHaveBeenCalled();
    expect(users.deletarPorId).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao verificar a senha atual', async () => {
    const erro = new Error('Erro ao verificar senha');
    vi.mocked(security.verificarSenha).mockRejectedValue(erro);

    await expect(useCase.execute(dto)).rejects.toThrow(erro);

    expect(users.deletarPorId).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao excluir o usuário', async () => {
    const erro = new Error('Erro ao excluir usuário');
    vi.mocked(users.deletarPorId).mockRejectedValue(erro);

    await expect(useCase.execute(dto)).rejects.toThrow(erro);

    expect(users.buscarPorId).toHaveBeenCalledWith(dto.id);
    expect(security.verificarSenha).toHaveBeenCalledWith(usuario.senha, dto.senhaAtual);
    expect(users.deletarPorId).toHaveBeenCalledWith(dto.id);
  });
});
