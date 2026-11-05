import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsuarioRepositorioPorta, CriarUsuarioDados, AtualizarUsuarioDados } from '../../../../application/ports/saida/usuario-repository.ports';
import { Usuario } from '../../../../domain/entities/usuario';

@Injectable()
export class PrismaUsuarioRepositoryAdapter implements UsuarioRepositorioPorta {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({ where: { email } });
  }
  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({ where: { id } });
  }
  async criar(data: CriarUsuarioDados): Promise<Usuario> {
    return this.prisma.usuario.create({
      data: { ...data, admin: false },
    });
  }
  async atualizar(id: string, data: AtualizarUsuarioDados): Promise<Usuario> {
    return this.prisma.usuario.update({
      where: { id },
      data,
    });
  }
  async deletarPorId(id: string): Promise<Usuario> {
    return this.prisma.usuario.delete({ where: { id } });
  }
}