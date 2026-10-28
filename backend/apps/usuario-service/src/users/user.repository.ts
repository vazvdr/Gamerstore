
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  buscarPorEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  buscarPorId(id: string) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  criar(data: { nome: string; email: string; senha: string }) {
    return this.prisma.usuario.create({
      data: { ...data, admin: false },
    });
  }
}
