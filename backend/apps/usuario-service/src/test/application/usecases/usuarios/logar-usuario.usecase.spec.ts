import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LogarUsuarioUseCase } from '../../../../application/usecases/usuarios/logar-usuario.usecase';
import { UsuarioMapper } from '../../../../application/mappers/usuario.mapper';
import type { UsuarioRepositorioPorta } from '../../../../application/ports/saida/usuario-repository.ports';
import type { SenhaCriptografiaPorta } from '../../../../application/ports/saida/senha-criptografia.ports';
import type { TokenAutenticacaoPorta } from '../../../../application/ports/saida/token-autenticacao.ports';
import type { SessaoUsuarioPorta } from '../../../../application/ports/saida/sessao-usuario.ports';
import type { TentativaLoginPorta } from '../../../../application/ports/saida/tentativa-login.ports';
import type { Usuario } from '../../../../domain/entities/usuario';
import type { LogarUsuarioDto } from '../../../../adapters/entrada/http/dto/usuario/logar-usuario.dto';

describe('LogarUsuarioUseCase', () => {
  let useCase: LogarUsuarioUseCase;
  let users: UsuarioRepositorioPorta;
  let security: SenhaCriptografiaPorta;
  let tokens: TokenAutenticacaoPorta;
  let sessao: SessaoUsuarioPorta;
  let tentativas: TentativaLoginPorta;

  const ip = '192.168.0.10';

  const dto = {
    email: ' TESTE@EMAIL.COM ',
    senha: 'Senha@123',
  } as LogarUsuarioDto;

  const usuario: Usuario = {
    id: '1',
    admin: false,
    nome: 'Joazinho',
    email: 'teste@email.com',
    senha: 'senha-hash',
  };
  beforeEach(() => {
    users = {
      buscarPorEmail: vi.fn().mockResolvedValue(usuario),
      buscarPorId: vi.fn(),
      criar: vi.fn(),
      atualizar: vi.fn(),
      deletarPorId: vi.fn(),
    };
    security = {
      hashSenha: vi.fn(),
      verificarSenha: vi.fn().mockResolvedValue(true),
    };
    tokens = {
      gerarAccessToken: vi.fn().mockResolvedValue('access-token'),
      gerarRefreshToken: vi.fn().mockResolvedValue('refresh-token'),
      verificarRefreshToken: vi.fn(),
    };
    sessao = {
      registrarRefreshToken: vi.fn().mockResolvedValue(true),
      rotacionarRefreshToken: vi.fn(),
    };
    tentativas = {
      consultarBloqueio: vi.fn().mockResolvedValue(0),
      registrarFalha: vi.fn().mockResolvedValue({
        bloqueado: false,
        tentativas: 1,
        tempoRestante: 0,
      }),
      limparTentativas: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new LogarUsuarioUseCase(users, security, tokens, sessao, tentativas);
  });

  it('deve realizar login com sucesso e registrar a sessão', async () => {
    const mapperSpy = vi.spyOn(UsuarioMapper, 'paraPerfil');
    const resultado = await useCase.execute(dto, ip);
    expect(tentativas.consultarBloqueio).toHaveBeenCalledWith(ip);
    expect(users.buscarPorEmail).toHaveBeenCalledWith('teste@email.com');
    expect(security.verificarSenha).toHaveBeenCalledWith('senha-hash', dto.senha);
    expect(tentativas.limparTentativas).toHaveBeenCalledWith(ip);
    expect(tokens.gerarAccessToken).toHaveBeenCalledWith({
      sub: '1',
      email: 'teste@email.com',
    });
    expect(tokens.gerarRefreshToken).toHaveBeenCalledWith({
      sub: '1',
      email: 'teste@email.com',
    });
    expect(sessao.registrarRefreshToken).toHaveBeenCalledWith('refresh-token', '1');
    expect(mapperSpy).toHaveBeenCalledWith(usuario);
    expect(resultado).toEqual({
      id: '1',
      nome: 'Joazinho',
      email: 'teste@email.com',
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
  });

  it('deve lançar UnauthorizedException quando o IP já estiver bloqueado', async () => {
    vi.mocked(tentativas.consultarBloqueio).mockResolvedValue(120);
    await expect(useCase.execute(dto, ip)).rejects.toThrow(
      new UnauthorizedException('Muitas tentativas. Tente novamente em 2 minuto(s).'),
    );
    expect(users.buscarPorEmail).not.toHaveBeenCalled();
    expect(security.verificarSenha).not.toHaveBeenCalled();
    expect(tentativas.registrarFalha).not.toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException quando o IP estiver bloqueado por menos de um minuto', async () => {
    vi.mocked(tentativas.consultarBloqueio).mockResolvedValue(30);
    await expect(useCase.execute(dto, ip)).rejects.toThrow(
      new UnauthorizedException('Muitas tentativas. Tente novamente em 1 minuto(s).'),
    );
    expect(users.buscarPorEmail).not.toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException quando o usuário não existir', async () => {
    vi.mocked(users.buscarPorEmail).mockResolvedValue(null);
    await expect(useCase.execute(dto, ip)).rejects.toThrow(
      new UnauthorizedException('E-mail ou senha inválidos.'),
    );
    expect(security.verificarSenha).not.toHaveBeenCalled();
    expect(tentativas.registrarFalha).toHaveBeenCalledWith(ip, 3, 300);
    expect(tokens.gerarAccessToken).not.toHaveBeenCalled();
    expect(sessao.registrarRefreshToken).not.toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException quando a senha for inválida', async () => {
    vi.mocked(security.verificarSenha).mockResolvedValue(false);
    await expect(useCase.execute(dto, ip)).rejects.toThrow(
      new UnauthorizedException('E-mail ou senha inválidos.'),
    );
    expect(tentativas.registrarFalha).toHaveBeenCalledWith(ip, 3, 300);
    expect(tokens.gerarAccessToken).not.toHaveBeenCalled();
    expect(sessao.registrarRefreshToken).not.toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException quando atingir o limite de tentativas', async () => {
    vi.mocked(security.verificarSenha).mockResolvedValue(false);
    vi.mocked(tentativas.registrarFalha).mockResolvedValue({
      bloqueado: true,
      tentativas: 3,
      tempoRestante: 300,
    });
    await expect(useCase.execute(dto, ip)).rejects.toThrow(
      new UnauthorizedException('Muitas tentativas. Login bloqueado por 5 minutos.'),
    );
    expect(tentativas.registrarFalha).toHaveBeenCalledWith(ip, 3, 300);
    expect(tokens.gerarAccessToken).not.toHaveBeenCalled();
  });

  it('deve informar o tempo restante quando houver bloqueio antes de atingir o limite de tentativas', async () => {
    vi.mocked(security.verificarSenha).mockResolvedValue(false);
    vi.mocked(tentativas.registrarFalha).mockResolvedValue({
      bloqueado: true,
      tentativas: 2,
      tempoRestante: 90,
    });
    await expect(useCase.execute(dto, ip)).rejects.toThrow(
      new UnauthorizedException('Muitas tentativas. Tente novamente em 2 minuto(s).'),
    );
    expect(tentativas.registrarFalha).toHaveBeenCalledWith(ip, 3, 300);
  });

  it('deve propagar erro ao consultar o bloqueio', async () => {
    const error = new Error('Erro ao consultar bloqueio.');
    vi.mocked(tentativas.consultarBloqueio).mockRejectedValue(error);
    await expect(useCase.execute(dto, ip)).rejects.toBe(error);
    expect(users.buscarPorEmail).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao buscar usuário por e-mail', async () => {
    const error = new Error('Erro ao consultar usuário.');
    vi.mocked(users.buscarPorEmail).mockRejectedValue(error);
    await expect(useCase.execute(dto, ip)).rejects.toBe(error);
    expect(security.verificarSenha).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao verificar a senha', async () => {
    const error = new Error('Erro ao verificar senha.');
    vi.mocked(security.verificarSenha).mockRejectedValue(error);
    await expect(useCase.execute(dto, ip)).rejects.toBe(error);
    expect(tentativas.registrarFalha).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao registrar falha de login', async () => {
    const error = new Error('Erro ao registrar tentativa.');
    vi.mocked(security.verificarSenha).mockResolvedValue(false);
    vi.mocked(tentativas.registrarFalha).mockRejectedValue(error);
    await expect(useCase.execute(dto, ip)).rejects.toBe(error);
    expect(tokens.gerarAccessToken).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao limpar as tentativas após autenticação', async () => {
    const error = new Error('Erro ao limpar tentativas.');
    vi.mocked(tentativas.limparTentativas).mockRejectedValue(error);
    await expect(useCase.execute(dto, ip)).rejects.toBe(error);
    expect(tokens.gerarAccessToken).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao gerar access token', async () => {
    const error = new Error('Erro ao gerar access token.');
    vi.mocked(tokens.gerarAccessToken).mockRejectedValue(error);
    await expect(useCase.execute(dto, ip)).rejects.toBe(error);
    expect(sessao.registrarRefreshToken).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao gerar refresh token', async () => {
    const error = new Error('Erro ao gerar refresh token.');
    vi.mocked(tokens.gerarRefreshToken).mockRejectedValue(error);
    await expect(useCase.execute(dto, ip)).rejects.toBe(error);
    expect(sessao.registrarRefreshToken).not.toHaveBeenCalled();
  });

  it('deve lançar InternalServerErrorException quando não conseguir registrar a sessão', async () => {
    vi.mocked(sessao.registrarRefreshToken).mockResolvedValue(false);
    await expect(useCase.execute(dto, ip)).rejects.toThrow(
      new InternalServerErrorException('Não foi possível registrar a sessão.'),
    );
    expect(sessao.registrarRefreshToken).toHaveBeenCalledWith('refresh-token', '1');
  });

  it('deve propagar erro ao registrar a sessão', async () => {
    const error = new Error('Erro ao registrar sessão.');
    vi.mocked(sessao.registrarRefreshToken).mockRejectedValue(error);
    await expect(useCase.execute(dto, ip)).rejects.toBe(error);
  });
});
