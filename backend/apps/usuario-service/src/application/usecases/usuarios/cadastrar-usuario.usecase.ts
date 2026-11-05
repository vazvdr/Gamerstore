import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { USUARIO_REPOSITORIO, UsuarioRepositorioPorta } from '../../ports/saida/usuario-repository.ports';
import { SENHA_CRIPTOGRAFIA, SenhaCriptografiaPorta } from '../../ports/saida/senha-criptografia.ports';
import { CadastrarUsuarioDto } from '../../../adapters/entrada/http/dto/usuario/cadastrar-usuario.dto';
import { UsuarioMapper } from '../../mappers/usuario.mapper';

@Injectable()
export class CadastrarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORIO)
    private readonly users: UsuarioRepositorioPorta,
    @Inject(SENHA_CRIPTOGRAFIA)
    private readonly security: SenhaCriptografiaPorta,
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
    return UsuarioMapper.paraPerfil(usuario);
  }
}
