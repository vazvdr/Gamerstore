import { Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { USUARIO_REPOSITORIO, UsuarioRepositorioPorta } from '../../ports/saida/usuario-repository.ports';
import { SENHA_CRIPTOGRAFIA, SenhaCriptografiaPorta } from '../../ports/saida/senha-criptografia.ports';
import { TOKEN_AUTENTICACAO, TokenAutenticacaoPorta } from '../../ports/saida/token-autenticacao.ports';
import { SESSAO_USUARIO, SessaoUsuarioPorta } from '../../ports/saida/sessao-usuario.ports';
import { TENTATIVA_LOGIN, TentativaLoginPorta } from '../../ports/saida/tentativa-login.ports';
import { LogarUsuarioDto } from '../../../adapters/entrada/http/dto/usuario/logar-usuario.dto';
import { UsuarioMapper } from '../../mappers/usuario.mapper';

@Injectable()
export class LogarUsuarioUseCase {
  private readonly maxTentativas = 3;
  private readonly tempoBloqueio = 5 * 60;

  constructor(
    @Inject(USUARIO_REPOSITORIO)
    private readonly users: UsuarioRepositorioPorta,
    @Inject(SENHA_CRIPTOGRAFIA)
    private readonly security: SenhaCriptografiaPorta,
    @Inject(TOKEN_AUTENTICACAO)
    private readonly tokens: TokenAutenticacaoPorta,
    @Inject(SESSAO_USUARIO)
    private readonly sessao: SessaoUsuarioPorta,
    @Inject(TENTATIVA_LOGIN)
    private readonly tentativas: TentativaLoginPorta,
  ) {}

  async execute(dto: LogarUsuarioDto, ip: string) {
    const tempoRestante = await this.tentativas.consultarBloqueio(ip);
    if (tempoRestante > 0) {
      const minutosRestantes = Math.ceil(tempoRestante / 60);
      throw new UnauthorizedException(
        `Muitas tentativas. Tente novamente em ${minutosRestantes} minuto(s).`,
      );
    }
    const email = dto.email.trim().toLowerCase();
    const usuario = await this.users.buscarPorEmail(email);
    const senhaValida = usuario
      ? await this.security.verificarSenha(usuario.senha, dto.senha)
      : false;
    if (!senhaValida) {
      const resultado = await this.tentativas.registrarFalha(
        ip,
        this.maxTentativas,
        this.tempoBloqueio,
      );
      if (resultado.bloqueado) {
        if (resultado.tentativas >= this.maxTentativas) {
          throw new UnauthorizedException('Muitas tentativas. Login bloqueado por 5 minutos.');
        }
        const minutosRestantes = Math.ceil(resultado.tempoRestante / 60);
        throw new UnauthorizedException(
          `Muitas tentativas. Tente novamente em ${minutosRestantes} minuto(s).`,
        );
      }
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }
    await this.tentativas.limparTentativas(ip);
    const payload = { sub: String(usuario!.id), email: usuario!.email };
    const [access_token, refresh_token] = await Promise.all([
      this.tokens.gerarAccessToken(payload),
      this.tokens.gerarRefreshToken(payload),
    ]);
    const registrado = await this.sessao.registrarRefreshToken(
      refresh_token,
      String(usuario!.id),
    );
    if (!registrado) {
      throw new InternalServerErrorException('Não foi possível registrar a sessão.');
    }
    return {
      ...UsuarioMapper.paraPerfil(usuario!),
      access_token,
      refresh_token,
    };
  }
}