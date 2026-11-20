
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { RedefinirSenhaUseCase } from '../../../../application/usecases/usuarios/redefinir-senha.usecase';
import type { UsuarioRepositorioPorta } from '../../../../application/ports/saida/usuario-repository.ports';
import type { SenhaCriptografiaPorta } from '../../../../application/ports/saida/senha-criptografia.ports';
import type { TokenRecuperacaoSenhaPorta } from '../../../../application/ports/saida/token-recuperacao-senha.ports';
import type { RedefinirSenhaDto } from '../../../../adapters/entrada/http/dto/usuario/redefinir-senha.dto';

describe('RedefinirSenhaUseCase', () => {
  let useCase: RedefinirSenhaUseCase;
  let users: UsuarioRepositorioPorta;
  let security: SenhaCriptografiaPorta;
  let tokens: TokenRecuperacaoSenhaPorta;

  const dto: RedefinirSenhaDto = {
    token: 'token-recuperacao-valido',
    senha: 'nova-senha-segura',
  };

  const tokenHash = 'e33ed2badb4495bb42592cc9f82f94ff9f4e3bbd73d2e554765992e870866984';

  beforeEach(() => {
    users = {
      buscarPorEmail: vi.fn(),
      buscarPorId: vi.fn(),
      criar: vi.fn(),
      atualizar: vi.fn().mockResolvedValue({}),
      deletarPorId: vi.fn(),
    };

    security = {
      hashSenha: vi.fn().mockResolvedValue('senha-hash'),
      verificarSenha: vi.fn(),
    };

    tokens = {
      registrar: vi.fn(),
      buscar: vi.fn().mockResolvedValue('usuario-1'),
      consumir: vi.fn().mockResolvedValue(true),
    };

    useCase = new RedefinirSenhaUseCase(users, security, tokens);
  });

  it('deve redefinir a senha com sucesso', async () => {
    const resultado = await useCase.execute(dto);

    expect(tokens.buscar).toHaveBeenCalledWith(tokenHash);
    expect(tokens.consumir).toHaveBeenCalledWith(tokenHash, 'usuario-1');
    expect(security.hashSenha).toHaveBeenCalledWith(dto.senha);
    expect(users.atualizar).toHaveBeenCalledWith('usuario-1', {
      senha: 'senha-hash',
    });
    expect(resultado).toEqual({
      message: 'Senha redefinida com sucesso.',
    });
  });

  it('deve gerar o hash SHA-256 do token antes de consultar o repositório', async () => {
    await useCase.execute(dto);

    expect(tokens.buscar).toHaveBeenCalledTimes(1);
    expect(tokens.buscar).toHaveBeenCalledWith(tokenHash);
  });

  it('deve lançar UnauthorizedException quando o token não for encontrado', async () => {
    vi.mocked(tokens.buscar).mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(
      new UnauthorizedException('Token de recuperação inválido ou expirado.'),
    );

    expect(tokens.consumir).not.toHaveBeenCalled();
    expect(security.hashSenha).not.toHaveBeenCalled();
    expect(users.atualizar).not.toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException quando o token não puder ser consumido', async () => {
    vi.mocked(tokens.consumir).mockResolvedValue(false);

    await expect(useCase.execute(dto)).rejects.toThrow(
      new UnauthorizedException('Token de recuperação inválido ou expirado.'),
    );

    expect(tokens.buscar).toHaveBeenCalledWith(tokenHash);
    expect(tokens.consumir).toHaveBeenCalledWith(tokenHash, 'usuario-1');
    expect(security.hashSenha).not.toHaveBeenCalled();
    expect(users.atualizar).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao consultar o token', async () => {
    const erro = new Error('Erro ao consultar token');
    vi.mocked(tokens.buscar).mockRejectedValue(erro);

    await expect(useCase.execute(dto)).rejects.toThrow(erro);

    expect(tokens.consumir).not.toHaveBeenCalled();
    expect(security.hashSenha).not.toHaveBeenCalled();
    expect(users.atualizar).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao consumir o token', async () => {
    const erro = new Error('Erro ao consumir token');
    vi.mocked(tokens.consumir).mockRejectedValue(erro);

    await expect(useCase.execute(dto)).rejects.toThrow(erro);

    expect(security.hashSenha).not.toHaveBeenCalled();
    expect(users.atualizar).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao gerar o hash da nova senha', async () => {
    const erro = new Error('Erro ao gerar hash da senha');
    vi.mocked(security.hashSenha).mockRejectedValue(erro);

    await expect(useCase.execute(dto)).rejects.toThrow(erro);

    expect(tokens.consumir).toHaveBeenCalledWith(tokenHash, 'usuario-1');
    expect(users.atualizar).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao atualizar a senha do usuário', async () => {
    const erro = new Error('Erro ao atualizar usuário');
    vi.mocked(users.atualizar).mockRejectedValue(erro);

    await expect(useCase.execute(dto)).rejects.toThrow(erro);

    expect(tokens.consumir).toHaveBeenCalledWith(tokenHash, 'usuario-1');
    expect(security.hashSenha).toHaveBeenCalledWith(dto.senha);
    expect(users.atualizar).toHaveBeenCalledWith('usuario-1', {
      senha: 'senha-hash',
    });
  });
});
