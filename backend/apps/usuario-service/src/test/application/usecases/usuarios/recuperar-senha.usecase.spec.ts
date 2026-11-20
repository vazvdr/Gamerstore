
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { RecuperarSenhaUseCase } from '../../../../application/usecases/usuarios/recuperar-senha.usecase';
import type { UsuarioRepositorioPorta } from '../../../../application/ports/saida/usuario-repository.ports';
import type { TokenRecuperacaoSenhaPorta } from '../../../../application/ports/saida/token-recuperacao-senha.ports';
import type { NotificacaoRecuperacaoSenhaPorta } from '../../../../application/ports/saida/notificacao-recuperacao-senha.ports';
import type { ConfiguracaoRecuperacaoSenhaPorta } from '../../../../application/ports/saida/configuracao-recuperacao-senha.ports';
import type { Usuario } from '../../../../domain/entities/usuario';
import type { RecuperarSenhaDto } from '../../../../adapters/entrada/http/dto/usuario/recuperar-senha.dto';

describe('RecuperarSenhaUseCase', () => {
  let useCase: RecuperarSenhaUseCase;
  let users: UsuarioRepositorioPorta;
  let tokens: TokenRecuperacaoSenhaPorta;
  let notificacao: NotificacaoRecuperacaoSenhaPorta;
  let configuracao: ConfiguracaoRecuperacaoSenhaPorta;

  const dto: RecuperarSenhaDto = {
    email: 'teste@email.com',
  };

  const usuario: Usuario = {
    id: '1',
    admin: false,
    nome: 'Joazinho',
    email: 'teste@email.com',
    senha: 'senha-hash',
  };

  const resposta = {
    message: 'Se o e-mail estiver cadastrado, você receberá instruções para recuperar sua senha.',
  };

  beforeEach(() => {
    users = {
      buscarPorEmail: vi.fn().mockResolvedValue(usuario),
      buscarPorId: vi.fn(),
      criar: vi.fn(),
      atualizar: vi.fn(),
      deletarPorId: vi.fn(),
    };

    tokens = {
      registrar: vi.fn().mockResolvedValue(true),
      buscar: vi.fn(),
      consumir: vi.fn(),
    };

    notificacao = {
      enviar: vi.fn().mockResolvedValue(undefined),
    };

    configuracao = {
      obterTtl: vi.fn().mockReturnValue(900),
      obterUrlFrontend: vi.fn().mockReturnValue('https://gamerstore.com/'),
    };

    useCase = new RecuperarSenhaUseCase(users, tokens, notificacao, configuracao);
  });

  it('deve gerar e registrar o token e enviar a notificação de recuperação', async () => {
    const resultado = await useCase.execute(dto);

    expect(users.buscarPorEmail).toHaveBeenCalledWith(dto.email);
    expect(configuracao.obterTtl).toHaveBeenCalled();
    expect(configuracao.obterUrlFrontend).toHaveBeenCalled();

    expect(tokens.registrar).toHaveBeenCalledOnce();

    const [tokenHash, usuarioId, ttl] = vi.mocked(tokens.registrar).mock.calls[0];

    expect(tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(usuarioId).toBe('1');
    expect(ttl).toBe(900);

    expect(notificacao.enviar).toHaveBeenCalledOnce();

    const dadosNotificacao = vi.mocked(notificacao.enviar).mock.calls[0][0];
    const url = new URL(dadosNotificacao.link);
    const token = url.searchParams.get('token');

    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(token).not.toBe(tokenHash);

    expect(dadosNotificacao).toEqual({
      usuarioId: '1',
      nome: 'Joazinho',
      email: 'teste@email.com',
      link: `https://gamerstore.com/redefinir-senha?token=${token}`,
    });

    expect(resultado).toEqual(resposta);
  });

  it('deve remover barras finais da URL do frontend', async () => {
    vi.mocked(configuracao.obterUrlFrontend).mockReturnValue('https://gamerstore.com///');

    await useCase.execute(dto);

    const dadosNotificacao = vi.mocked(notificacao.enviar).mock.calls[0][0];

    expect(dadosNotificacao.link).toMatch(
      /^https:\/\/gamerstore\.com\/redefinir-senha\?token=[a-f0-9]{64}$/,
    );
  });

  it('deve retornar a mensagem padrão quando o e-mail não estiver cadastrado', async () => {
    vi.mocked(users.buscarPorEmail).mockResolvedValue(null);

    const resultado = await useCase.execute(dto);

    expect(resultado).toEqual(resposta);
    expect(tokens.registrar).not.toHaveBeenCalled();
    expect(notificacao.enviar).not.toHaveBeenCalled();
    expect(configuracao.obterTtl).not.toHaveBeenCalled();
    expect(configuracao.obterUrlFrontend).not.toHaveBeenCalled();
  });

  it('deve lançar InternalServerErrorException quando não conseguir registrar o token', async () => {
    vi.mocked(tokens.registrar).mockResolvedValue(false);

    await expect(useCase.execute(dto)).rejects.toThrow(
      new InternalServerErrorException('Não foi possível gerar o token de recuperação.'),
    );

    expect(notificacao.enviar).not.toHaveBeenCalled();
  });

  it('deve lançar ServiceUnavailableException quando não conseguir enviar a notificação', async () => {
    vi.mocked(notificacao.enviar).mockRejectedValue(new Error('Falha no serviço de e-mail.'));

    await expect(useCase.execute(dto)).rejects.toThrow(
      new ServiceUnavailableException(
        'Não foi possível processar a solicitação de recuperação de senha.',
      ),
    );
  });

  it('deve propagar erro ao buscar usuário por e-mail', async () => {
    const error = new Error('Erro ao consultar usuário.');

    vi.mocked(users.buscarPorEmail).mockRejectedValue(error);

    await expect(useCase.execute(dto)).rejects.toBe(error);

    expect(tokens.registrar).not.toHaveBeenCalled();
    expect(notificacao.enviar).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao obter o TTL da configuração', async () => {
    const error = new Error('Erro ao obter TTL.');

    vi.mocked(configuracao.obterTtl).mockImplementation(() => {
      throw error;
    });

    await expect(useCase.execute(dto)).rejects.toBe(error);

    expect(tokens.registrar).not.toHaveBeenCalled();
    expect(notificacao.enviar).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao obter a URL do frontend', async () => {
    const error = new Error('Erro ao obter URL do frontend.');

    vi.mocked(configuracao.obterUrlFrontend).mockImplementation(() => {
      throw error;
    });

    await expect(useCase.execute(dto)).rejects.toBe(error);

    expect(tokens.registrar).toHaveBeenCalledOnce();
    expect(notificacao.enviar).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao registrar o token', async () => {
    const error = new Error('Erro ao registrar token.');

    vi.mocked(tokens.registrar).mockRejectedValue(error);

    await expect(useCase.execute(dto)).rejects.toBe(error);

    expect(notificacao.enviar).not.toHaveBeenCalled();
  });
});
