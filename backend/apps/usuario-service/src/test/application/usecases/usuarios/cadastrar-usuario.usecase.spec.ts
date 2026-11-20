
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConflictException } from '@nestjs/common';
import { CadastrarUsuarioUseCase } from '../../../../application/usecases/usuarios/cadastrar-usuario.usecase';
import { UsuarioMapper } from '../../../../application/mappers/usuario.mapper';
import type { UsuarioRepositorioPorta } from '../../../../application/ports/saida/usuario-repository.ports';
import type { SenhaCriptografiaPorta } from '../../../../application/ports/saida/senha-criptografia.ports';
import type { Usuario } from '../../../../domain/entities/usuario';
import type { CadastrarUsuarioDto } from '../../../../adapters/entrada/http/dto/usuario/cadastrar-usuario.dto';

describe('CadastrarUsuarioUseCase', () => {
  let useCase: CadastrarUsuarioUseCase;
  let users: UsuarioRepositorioPorta;
  let security: SenhaCriptografiaPorta;

  const dto = {
    nome: ' Joazinho ',
    email: ' TESTE@EMAIL.COM ',
    senha: 'Senha@123',
  } as CadastrarUsuarioDto;

  const usuarioCriado: Usuario = {
    id: '1',
    admin: false,
    nome: 'Joazinho',
    email: 'teste@email.com',
    senha: 'senha-hash',
  };

  beforeEach(() => {
    users = {
      buscarPorEmail: vi.fn().mockResolvedValue(null),
      buscarPorId: vi.fn(),
      criar: vi.fn().mockResolvedValue(usuarioCriado),
      atualizar: vi.fn(),
      deletarPorId: vi.fn(),
    };

    security = {
      hashSenha: vi.fn().mockResolvedValue('senha-hash'),
      verificarSenha: vi.fn(),
    };

    useCase = new CadastrarUsuarioUseCase(users, security);
  });

  it('deve cadastrar um usuário com dados normalizados', async () => {
    const mapperSpy = vi.spyOn(UsuarioMapper, 'paraPerfil');

    const resultado = await useCase.execute(dto);

    expect(users.buscarPorEmail).toHaveBeenCalledWith('teste@email.com');
    expect(security.hashSenha).toHaveBeenCalledWith('Senha@123');
    expect(users.criar).toHaveBeenCalledWith({
      nome: 'Joazinho',
      email: 'teste@email.com',
      senha: 'senha-hash',
    });
    expect(mapperSpy).toHaveBeenCalledWith(usuarioCriado);
    expect(resultado).toBeDefined();
  });

  it('deve lançar ConflictException quando o e-mail já estiver cadastrado', async () => {
    vi.mocked(users.buscarPorEmail).mockResolvedValue(usuarioCriado);

    await expect(useCase.execute(dto)).rejects.toThrow(
      new ConflictException('Este e-mail já está cadastrado.'),
    );

    expect(security.hashSenha).not.toHaveBeenCalled();
    expect(users.criar).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao consultar usuário por e-mail', async () => {
    const error = new Error('Erro ao consultar usuário.');

    vi.mocked(users.buscarPorEmail).mockRejectedValue(error);

    await expect(useCase.execute(dto)).rejects.toBe(error);

    expect(security.hashSenha).not.toHaveBeenCalled();
    expect(users.criar).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao gerar hash da senha', async () => {
    const error = new Error('Erro ao criptografar senha.');

    vi.mocked(security.hashSenha).mockRejectedValue(error);

    await expect(useCase.execute(dto)).rejects.toBe(error);

    expect(users.criar).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao criar usuário', async () => {
    const error = new Error('Erro ao cadastrar usuário.');

    vi.mocked(users.criar).mockRejectedValue(error);

    await expect(useCase.execute(dto)).rejects.toBe(error);

    expect(users.buscarPorEmail).toHaveBeenCalled();
    expect(security.hashSenha).toHaveBeenCalled();
  });
});
