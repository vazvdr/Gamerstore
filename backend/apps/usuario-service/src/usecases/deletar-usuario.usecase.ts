import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DeletarUsuarioInput } from '../dto/deletar-usuario.dto';
import { UserRepository } from '../users/user.repository';
import { UserSecurity } from '../users/user.security';

@Injectable()
export class DeletarUsuarioUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly security: UserSecurity,
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
