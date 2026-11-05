import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { USUARIO_REPOSITORIO, UsuarioRepositorioPorta } from '../../ports/saida/usuario-repository.ports';
import { SENHA_CRIPTOGRAFIA, SenhaCriptografiaPorta } from '../../ports/saida/senha-criptografia.ports';
import { EditarUsuarioInput } from '../../../adapters/entrada/http/dto/usuario/editar-usuario.dto';
import { UsuarioMapper } from '../../mappers/usuario.mapper';

@Injectable()
export class EditarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORIO)
    private readonly users: UsuarioRepositorioPorta,
    @Inject(SENHA_CRIPTOGRAFIA)
    private readonly security: SenhaCriptografiaPorta,
  ) {}

  async execute(dto: EditarUsuarioInput) {
    const usuario = await this.users.buscarPorId(dto.id);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    const senhaValida = await this.security.verificarSenha(usuario.senha, dto.senhaAtual);
    if (!senhaValida) {
      throw new UnauthorizedException('Senha atual inválida.');
    }
    const data: { nome?: string; email?: string; senha?: string } = {};
    if (dto.nome !== undefined) {
      const nome = dto.nome.trim();
      if (nome.length < 2) {
        throw new BadRequestException('O nome deve ter pelo menos 2 caracteres.');
      }
      if (nome !== usuario.nome) data.nome = nome;
    }
    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      if (email !== usuario.email) {
        const usuarioExistente = await this.users.buscarPorEmail(email);
        if (usuarioExistente && usuarioExistente.id !== usuario.id) {
          throw new ConflictException('Este e-mail já está cadastrado.');
        }
        data.email = email;
      }
    }
    if (dto.novaSenha !== undefined) {
      data.senha = await this.security.hashSenha(dto.novaSenha);
    }
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Nenhum dado foi alterado.');
    }
    const usuarioAtualizado = await this.users.atualizar(dto.id, data);
    return UsuarioMapper.paraPerfil(usuarioAtualizado);
  }
}
