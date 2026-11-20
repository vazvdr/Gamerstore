
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EditarUsuarioUseCase } from '../../../../application/usecases/usuarios/editar-usuario.usecase';
import { UsuarioMapper } from '../../../../application/mappers/usuario.mapper';
import type { UsuarioRepositorioPorta } from '../../../../application/ports/saida/usuario-repository.ports';
import type { SenhaCriptografiaPorta } from '../../../../application/ports/saida/senha-criptografia.ports';
import type { Usuario } from '../../../../domain/entities/usuario';
import type { EditarUsuarioInput } from '../../../../adapters/entrada/http/dto/usuario/editar-usuario.dto';

describe('EditarUsuarioUseCase', () => {
  let useCase: EditarUsuarioUseCase;
  let users: UsuarioRepositorioPorta;
  let security: SenhaCriptografiaPorta;

  const dto: EditarUsuarioInput = {
    id: '1',
    senhaAtual: 'Senha@123',
    nome: 'Novo Nome',
  };

  const usuario: Usuario = {
    id: '1',
    admin: false,
    nome: 'Joazinho',
    email: 'teste@email.com',
    senha: 'senha-hash',
  };

  const usuarioAtualizado: Usuario = {
    ...usuario,
    nome: 'Novo Nome',
  };

  beforeEach(() => {
    users = {
      buscarPorEmail: vi.fn().mockResolvedValue(null),
      buscarPorId: vi.fn().mockResolvedValue(usuario),
      criar: vi.fn(),
      atualizar: vi.fn().mockResolvedValue(usuarioAtualizado),
      deletarPorId: vi.fn(),
    };

    security = {
      hashSenha: vi.fn().mockResolvedValue('nova-senha-hash'),
      verificarSenha: vi.fn().mockResolvedValue(true),
    };

    useCase = new EditarUsuarioUseCase(users, security);
  });

  it('deve atualizar o nome e retornar o perfil do usuário', async () => {
    const mapperSpy = vi.spyOn(UsuarioMapper, 'paraPerfil');

    const resultado = await useCase.execute(dto);

    expect(users.buscarPorId).toHaveBeenCalledWith('1');
    expect(security.verificarSenha).toHaveBeenCalledWith('senha-hash', 'Senha@123');
    expect(users.atualizar).toHaveBeenCalledWith('1', { nome: 'Novo Nome' });
    expect(mapperSpy).toHaveBeenCalledWith(usuarioAtualizado);
    expect(resultado).toEqual({
      id: '1',
      nome: 'Novo Nome',
      email: 'teste@email.com',
    });
  });

  it('deve atualizar o e-mail normalizado', async () => {
    const resultado = await useCase.execute({
      id: '1',
      senhaAtual: 'Senha@123',
      email: ' NOVO@EMAIL.COM ',
    });

    expect(users.buscarPorEmail).toHaveBeenCalledWith('novo@email.com');
    expect(users.atualizar).toHaveBeenCalledWith('1', { email: 'novo@email.com' });
    expect(resultado).toBeDefined();
  });

  it('deve atualizar a senha utilizando o hash gerado', async () => {
    await useCase.execute({
      id: '1',
      senhaAtual: 'Senha@123',
      novaSenha: 'NovaSenha@123',
    });

    expect(security.hashSenha).toHaveBeenCalledWith('NovaSenha@123');
    expect(users.atualizar).toHaveBeenCalledWith('1', { senha: 'nova-senha-hash' });
  });

  it('deve atualizar nome, e-mail e senha simultaneamente', async () => {
    await useCase.execute({
      id: '1',
      senhaAtual: 'Senha@123',
      nome: ' Novo Nome ',
      email: ' NOVO@EMAIL.COM ',
      novaSenha: 'NovaSenha@123',
    });

    expect(users.buscarPorEmail).toHaveBeenCalledWith('novo@email.com');
    expect(security.hashSenha).toHaveBeenCalledWith('NovaSenha@123');
    expect(users.atualizar).toHaveBeenCalledWith('1', {
      nome: 'Novo Nome',
      email: 'novo@email.com',
      senha: 'nova-senha-hash',
    });
  });

  it('deve lançar NotFoundException quando o usuário não existir', async () => {
    vi.mocked(users.buscarPorId).mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(
      new NotFoundException('Usuário não encontrado.'),
    );

    expect(security.verificarSenha).not.toHaveBeenCalled();
    expect(users.atualizar).not.toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException quando a senha atual for inválida', async () => {
    vi.mocked(security.verificarSenha).mockResolvedValue(false);

    await expect(useCase.execute(dto)).rejects.toThrow(
      new UnauthorizedException('Senha atual inválida.'),
    );

    expect(users.atualizar).not.toHaveBeenCalled();
  });

  it('deve lançar BadRequestException quando o nome tiver menos de 2 caracteres', async () => {
    await expect(
      useCase.execute({
        id: '1',
        senhaAtual: 'Senha@123',
        nome: ' A ',
      }),
    ).rejects.toThrow(
      new BadRequestException('O nome deve ter pelo menos 2 caracteres.'),
    );

    expect(users.atualizar).not.toHaveBeenCalled();
  });

  it('deve lançar ConflictException quando o e-mail pertencer a outro usuário', async () => {
    vi.mocked(users.buscarPorEmail).mockResolvedValue({
      ...usuario,
      id: '2',
      email: 'outro@email.com',
    });

    await expect(
      useCase.execute({
        id: '1',
        senhaAtual: 'Senha@123',
        email: 'outro@email.com',
      }),
    ).rejects.toThrow(
      new ConflictException('Este e-mail já está cadastrado.'),
    );

    expect(users.atualizar).not.toHaveBeenCalled();
  });

  it('deve permitir manter o mesmo e-mail sem consultar duplicidade', async () => {
    await expect(
      useCase.execute({
        id: '1',
        senhaAtual: 'Senha@123',
        email: ' TESTE@EMAIL.COM ',
      }),
    ).rejects.toThrow(
      new BadRequestException('Nenhum dado foi alterado.'),
    );

    expect(users.buscarPorEmail).not.toHaveBeenCalled();
    expect(users.atualizar).not.toHaveBeenCalled();
  });

  it('deve permitir utilizar um e-mail já encontrado para o próprio usuário', async () => {
    vi.mocked(users.buscarPorEmail).mockResolvedValue(usuario);

    await useCase.execute({
      id: '1',
      senhaAtual: 'Senha@123',
      email: 'NOVO@EMAIL.COM',
    });

    expect(users.buscarPorEmail).toHaveBeenCalledWith('novo@email.com');
    expect(users.atualizar).toHaveBeenCalledWith('1', { email: 'novo@email.com' });
  });

  it('deve lançar BadRequestException quando nenhum dado for alterado', async () => {
    await expect(
      useCase.execute({
        id: '1',
        senhaAtual: 'Senha@123',
        nome: 'Joazinho',
        email: 'teste@email.com',
      }),
    ).rejects.toThrow(
      new BadRequestException('Nenhum dado foi alterado.'),
    );

    expect(users.atualizar).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao buscar usuário por ID', async () => {
    const error = new Error('Erro ao consultar usuário.');

    vi.mocked(users.buscarPorId).mockRejectedValue(error);

    await expect(useCase.execute(dto)).rejects.toBe(error);

    expect(security.verificarSenha).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao verificar a senha atual', async () => {
    const error = new Error('Erro ao verificar senha.');

    vi.mocked(security.verificarSenha).mockRejectedValue(error);

    await expect(useCase.execute(dto)).rejects.toBe(error);

    expect(users.atualizar).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao consultar e-mail existente', async () => {
    const error = new Error('Erro ao consultar e-mail.');

    vi.mocked(users.buscarPorEmail).mockRejectedValue(error);

    await expect(
      useCase.execute({
        id: '1',
        senhaAtual: 'Senha@123',
        email: 'novo@email.com',
      }),
    ).rejects.toBe(error);

    expect(users.atualizar).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao gerar hash da nova senha', async () => {
    const error = new Error('Erro ao criptografar senha.');

    vi.mocked(security.hashSenha).mockRejectedValue(error);

    await expect(
      useCase.execute({
        id: '1',
        senhaAtual: 'Senha@123',
        novaSenha: 'NovaSenha@123',
      }),
    ).rejects.toBe(error);

    expect(users.atualizar).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao atualizar usuário', async () => {
    const error = new Error('Erro ao atualizar usuário.');

    vi.mocked(users.atualizar).mockRejectedValue(error);

    await expect(useCase.execute(dto)).rejects.toBe(error);
  });

  it('deve remover espaços do nome antes de atualizar', async () => {
    await useCase.execute({
      id: '1',
      senhaAtual: 'Senha@123',
      nome: '  Novo Nome  ',
    });

    expect(users.atualizar).toHaveBeenCalledWith('1', { nome: 'Novo Nome' });
  });
});
