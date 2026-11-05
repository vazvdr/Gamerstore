import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { USUARIO_REPOSITORIO, UsuarioRepositorioPorta } from '../../ports/saida/usuario-repository.ports';
import { SENHA_CRIPTOGRAFIA, SenhaCriptografiaPorta } from '../../ports/saida/senha-criptografia.ports';
import { DeletarUsuarioInput } from '../../../adapters/entrada/http/dto/usuario/deletar-usuario.dto';

@Injectable()
export class DeletarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORIO)
    private readonly users: UsuarioRepositorioPorta,
    @Inject(SENHA_CRIPTOGRAFIA)
    private readonly security: SenhaCriptografiaPorta,
  ) {}

  async execute(dto: DeletarUsuarioInput) {
    const usuario = await this.users.buscarPorId(dto.id);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    const senhaValida = await this.security.verificarSenha(usuario.senha, dto.senhaAtual);
    if (!senhaValida) {
      throw new UnauthorizedException('Senha atual inválida.');
    }
    await this.users.deletarPorId(dto.id);
    return { message: 'Conta excluída com sucesso.' };
  }
}
