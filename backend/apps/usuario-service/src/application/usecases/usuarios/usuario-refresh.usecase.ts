import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { USUARIO_REPOSITORIO, UsuarioRepositorioPorta } from '../../ports/saida/usuario-repository.ports';
import { TOKEN_AUTENTICACAO, TokenAutenticacaoPorta } from '../../ports/saida/token-autenticacao.ports';
import { SESSAO_USUARIO, SessaoUsuarioPorta } from '../../ports/saida/sessao-usuario.ports';
import { RefreshTokenDto } from '../../../adapters/entrada/http/dto/usuario/refresh-token.dto';
import { UsuarioMapper } from '../../mappers/usuario.mapper';

@Injectable()
export class RefreshUsuarioUseCase {
  constructor(
    @Inject(TOKEN_AUTENTICACAO)
    private readonly tokens: TokenAutenticacaoPorta,
    @Inject(USUARIO_REPOSITORIO)
    private readonly users: UsuarioRepositorioPorta,
    @Inject(SESSAO_USUARIO)
    private readonly sessao: SessaoUsuarioPorta,
  ) {}

  async execute(dto: RefreshTokenDto) {
    const payload = await this.tokens.verificarRefreshToken(dto.refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Refresh token expirado ou inválido.');
    }
    const usuario = await this.users.buscarPorEmail(payload.email);
    if (!usuario || String(usuario.id) !== payload.sub) {
      throw new UnauthorizedException('Usuário não encontrado ou token inválido.');
    }
    const tokenPayload = { sub: String(usuario.id), email: usuario.email };
    const [access_token, refresh_token] = await Promise.all([
      this.tokens.gerarAccessToken(tokenPayload),
      this.tokens.gerarRefreshToken(tokenPayload),
    ]);
    const rotacionado = await this.sessao.rotacionarRefreshToken(
      dto.refreshToken,
      refresh_token,
      String(usuario.id),
    );
    if (rotacionado !== 1) {
      throw new UnauthorizedException('Refresh token já utilizado ou revogado.');
    }
    return {
      ...UsuarioMapper.paraPerfil(usuario),
      access_token,
      refresh_token,
    };
  }
}
