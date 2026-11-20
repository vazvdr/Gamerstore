
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshUsuarioUseCase } from '../../../../application/usecases/usuarios/usuario-refresh.usecase';
import { UsuarioMapper } from '../../../../application/mappers/usuario.mapper';
import type { UsuarioRepositorioPorta } from '../../../../application/ports/saida/usuario-repository.ports';
import type { TokenAutenticacaoPorta } from '../../../../application/ports/saida/token-autenticacao.ports';
import type { SessaoUsuarioPorta } from '../../../../application/ports/saida/sessao-usuario.ports';
import type { Usuario } from '../../../../domain/entities/usuario';
import type { RefreshTokenDto } from '../../../../adapters/entrada/http/dto/usuario/refresh-token.dto';

describe('RefreshUsuarioUseCase', () => {
  let useCase: RefreshUsuarioUseCase;
  let users: UsuarioRepositorioPorta;
  let tokens: TokenAutenticacaoPorta;
  let sessao: SessaoUsuarioPorta;

  const dto: RefreshTokenDto = {
    refreshToken: 'refresh-token-antigo',
  };

  const usuario: Usuario = {
    id: '1',
    admin: false,
    nome: 'Joazinho',
    email: 'teste@email.com',
    senha: 'senha-hash',
  };

  const payload = {
    sub: '1',
    email: 'teste@email.com',
    type: 'refresh' as const,
    jti: 'token-id',
  };

  beforeEach(() => {
    tokens = {
      verificarRefreshToken: vi.fn().mockResolvedValue(payload),
      gerarAccessToken: vi.fn().mockResolvedValue('novo-access-token'),
      gerarRefreshToken: vi.fn().mockResolvedValue('novo-refresh-token'),
    };

    users = {
      buscarPorEmail: vi.fn().mockResolvedValue(usuario),
      buscarPorId: vi.fn(),
      criar: vi.fn(),
      atualizar: vi.fn(),
      deletarPorId: vi.fn(),
    };

    sessao = {
      registrarRefreshToken: vi.fn(),
      rotacionarRefreshToken: vi.fn().mockResolvedValue(1),
    };

    useCase = new RefreshUsuarioUseCase(tokens, users, sessao);
  });

  it('deve renovar os tokens e rotacionar a sessão com sucesso', async () => {
    const mapperSpy = vi.spyOn(UsuarioMapper, 'paraPerfil');

    const resultado = await useCase.execute(dto);

    expect(tokens.verificarRefreshToken).toHaveBeenCalledWith(dto.refreshToken);
    expect(users.buscarPorEmail).toHaveBeenCalledWith(payload.email);

    expect(tokens.gerarAccessToken).toHaveBeenCalledWith({
      sub: '1',
      email: 'teste@email.com',
    });

    expect(tokens.gerarRefreshToken).toHaveBeenCalledWith({
      sub: '1',
      email: 'teste@email.com',
    });

    expect(sessao.rotacionarRefreshToken).toHaveBeenCalledWith(
      dto.refreshToken,
      'novo-refresh-token',
      '1',
    );

    expect(mapperSpy).toHaveBeenCalledWith(usuario);

    expect(resultado).toEqual({
      id: '1',
      nome: 'Joazinho',
      email: 'teste@email.com',
      access_token: 'novo-access-token',
      refresh_token: 'novo-refresh-token',
    });
  });

  it('deve lançar UnauthorizedException quando o refresh token for inválido ou expirado', async () => {
    vi.mocked(tokens.verificarRefreshToken).mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(
      new UnauthorizedException('Refresh token expirado ou inválido.'),
    );

    expect(users.buscarPorEmail).not.toHaveBeenCalled();
    expect(tokens.gerarAccessToken).not.toHaveBeenCalled();
    expect(tokens.gerarRefreshToken).not.toHaveBeenCalled();
    expect(sessao.rotacionarRefreshToken).not.toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException quando o usuário não existir', async () => {
    vi.mocked(users.buscarPorEmail).mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(
      new UnauthorizedException('Usuário não encontrado ou token inválido.'),
    );

    expect(tokens.gerarAccessToken).not.toHaveBeenCalled();
    expect(sessao.rotacionarRefreshToken).not.toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException quando o ID do usuário não corresponder ao payload', async () => {
    vi.mocked(users.buscarPorEmail).mockResolvedValue({
      ...usuario,
      id: '2',
    });

    await expect(useCase.execute(dto)).rejects.toThrow(
      new UnauthorizedException('Usuário não encontrado ou token inválido.'),
    );

    expect(tokens.gerarAccessToken).not.toHaveBeenCalled();
    expect(sessao.rotacionarRefreshToken).not.toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException quando o refresh token já tiver sido utilizado ou revogado', async () => {
    vi.mocked(sessao.rotacionarRefreshToken).mockResolvedValue(0);

    await expect(useCase.execute(dto)).rejects.toThrow(
      new UnauthorizedException('Refresh token já utilizado ou revogado.'),
    );

    expect(sessao.rotacionarRefreshToken).toHaveBeenCalledWith(
      dto.refreshToken,
      'novo-refresh-token',
      '1',
    );
  });

  it('deve lançar UnauthorizedException quando a rotação retornar um valor diferente de 1', async () => {
    vi.mocked(sessao.rotacionarRefreshToken).mockResolvedValue(2);

    await expect(useCase.execute(dto)).rejects.toThrow(
      new UnauthorizedException('Refresh token já utilizado ou revogado.'),
    );
  });

  it('deve propagar erro ao verificar o refresh token', async () => {
    const error = new Error('Erro ao verificar refresh token.');

    vi.mocked(tokens.verificarRefreshToken).mockRejectedValue(error);

    await expect(useCase.execute(dto)).rejects.toBe(error);

    expect(users.buscarPorEmail).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao buscar usuário por e-mail', async () => {
    const error = new Error('Erro ao consultar usuário.');

    vi.mocked(users.buscarPorEmail).mockRejectedValue(error);

    await expect(useCase.execute(dto)).rejects.toBe(error);

    expect(tokens.gerarAccessToken).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao gerar access token', async () => {
    const error = new Error('Erro ao gerar access token.');

    vi.mocked(tokens.gerarAccessToken).mockRejectedValue(error);

    await expect(useCase.execute(dto)).rejects.toBe(error);

    expect(sessao.rotacionarRefreshToken).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao gerar refresh token', async () => {
    const error = new Error('Erro ao gerar refresh token.');

    vi.mocked(tokens.gerarRefreshToken).mockRejectedValue(error);

    await expect(useCase.execute(dto)).rejects.toBe(error);

    expect(sessao.rotacionarRefreshToken).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao rotacionar o refresh token', async () => {
    const error = new Error('Erro ao rotacionar refresh token.');

    vi.mocked(sessao.rotacionarRefreshToken).mockRejectedValue(error);

    await expect(useCase.execute(dto)).rejects.toBe(error);
  });
});
