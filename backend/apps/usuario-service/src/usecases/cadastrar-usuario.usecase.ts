import { ConflictException, Injectable } from '@nestjs/common';
import { CadastrarUsuarioDto } from '../dto/cadastrar-usuario.dto';
import { UserMapper } from '../users/user.mapper';
import { UserRepository } from '../users/user.repository';
import { UserSecurity } from '../users/user.security';

@Injectable()
export class CadastrarUsuarioUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly security: UserSecurity,
  ) {}

  async execute(dto: CadastrarUsuarioDto) {
    const email = dto.email.trim().toLowerCase();

    if (await this.users.buscarPorEmail(email)) {
      throw new ConflictException('Este e-mail já está cadastrado.');
    }

    const senha = await this.security.hashSenha(dto.senha);
    const usuario = await this.users.criar({
      nome: dto.nome.trim(),
      email,
      senha,
    });

    return UserMapper.paraPerfil(usuario);
  }
}
