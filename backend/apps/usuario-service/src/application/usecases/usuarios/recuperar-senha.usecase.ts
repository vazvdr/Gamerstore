import { Inject, Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { USUARIO_REPOSITORIO, UsuarioRepositorioPorta } from '../../ports/saida/usuario-repository.ports';
import { TOKEN_RECUPERACAO_SENHA, TokenRecuperacaoSenhaPorta } from '../../ports/saida/token-recuperacao-senha.ports';
import { NOTIFICACAO_RECUPERACAO_SENHA, NotificacaoRecuperacaoSenhaPorta } from '../../ports/saida/notificacao-recuperacao-senha.ports';
import { CONFIGURACAO_RECUPERACAO_SENHA, ConfiguracaoRecuperacaoSenhaPorta } from '../../ports/saida/configuracao-recuperacao-senha.ports';
import { RecuperarSenhaDto } from '../../../adapters/entrada/http/dto/usuario/recuperar-senha.dto';

@Injectable()
export class RecuperarSenhaUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORIO)
    private readonly userRepository: UsuarioRepositorioPorta,
    @Inject(TOKEN_RECUPERACAO_SENHA)
    private readonly tokens: TokenRecuperacaoSenhaPorta,
    @Inject(NOTIFICACAO_RECUPERACAO_SENHA)
    private readonly notificacao: NotificacaoRecuperacaoSenhaPorta,
    @Inject(CONFIGURACAO_RECUPERACAO_SENHA)
    private readonly configuracao: ConfiguracaoRecuperacaoSenhaPorta,
  ) {}

  async execute({ email }: RecuperarSenhaDto) {
    const usuario = await this.userRepository.buscarPorEmail(email);
    if (usuario) {
      const token = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const ttl = this.configuracao.obterTtl();
      const registrado = await this.tokens.registrar(tokenHash, String(usuario.id), ttl);
      if (!registrado) {
        throw new InternalServerErrorException('Não foi possível gerar o token de recuperação.');
      }
      const frontendUrl = this.configuracao.obterUrlFrontend().replace(/\/+$/, '');
      const link = `${frontendUrl}/redefinir-senha?token=${token}`;
      try {
        await this.notificacao.enviar({
          usuarioId: String(usuario.id),
          nome: usuario.nome,
          email: usuario.email,
          link,
        });
      } catch {
        throw new ServiceUnavailableException('Não foi possível processar a solicitação de recuperação de senha.');
      }
    }
    return {
      message: 'Se o e-mail estiver cadastrado, você receberá instruções para recuperar sua senha.',
    };
  }
}