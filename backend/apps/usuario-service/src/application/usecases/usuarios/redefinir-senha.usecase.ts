import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { USUARIO_REPOSITORIO, UsuarioRepositorioPorta } from '../../ports/saida/usuario-repository.ports';
import { SENHA_CRIPTOGRAFIA, SenhaCriptografiaPorta } from '../../ports/saida/senha-criptografia.ports';
import { TOKEN_RECUPERACAO_SENHA, TokenRecuperacaoSenhaPorta } from '../../ports/saida/token-recuperacao-senha.ports';
import { RedefinirSenhaDto } from '../../../adapters/entrada/http/dto/usuario/redefinir-senha.dto';

@Injectable()
export class RedefinirSenhaUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORIO)
    private readonly users: UsuarioRepositorioPorta,
    @Inject(SENHA_CRIPTOGRAFIA)
    private readonly security: SenhaCriptografiaPorta,
    @Inject(TOKEN_RECUPERACAO_SENHA)
    private readonly tokens: TokenRecuperacaoSenhaPorta,
  ) {}

  async execute(dto: RedefinirSenhaDto) {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const usuarioId = await this.tokens.buscar(tokenHash);
    if (!usuarioId) {
      throw new UnauthorizedException('Token de recuperação inválido ou expirado.');
    }
    const tokenConsumido = await this.tokens.consumir(tokenHash, usuarioId);
    if (!tokenConsumido) {
      throw new UnauthorizedException('Token de recuperação inválido ou expirado.');
    }
    const senhaHash = await this.security.hashSenha(dto.senha);
    await this.users.atualizar(usuarioId, { senha: senhaHash });
    return {
      message: 'Senha redefinida com sucesso.',
    };
  }
}
