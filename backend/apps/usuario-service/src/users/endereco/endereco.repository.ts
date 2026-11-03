import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class EnderecoRepository {
  constructor(private readonly prisma: PrismaService) {}

  criar(data: {
    bairro: string;
    cep: string;
    cidade: string;
    complemento?: string;
    estado: string;
    numero: string;
    rua: string;
    user_id: string;
    principal?: boolean;
  }) {
    return this.prisma.$transaction(async (transaction) => {
      if (data.principal) {
        await transaction.endereco.updateMany({
          where: { user_id: data.user_id, principal: true },
          data: { principal: false },
        });
      }
      return transaction.endereco.create({ data });
    });
  }
  buscarPorId(id: string, user_id: string) {
    return this.prisma.endereco.findFirst({ where: { id, user_id } });
  }
  listarPorUsuario(user_id: string) {
    return this.prisma.endereco.findMany({
      where: { user_id },
      orderBy: [{ principal: 'desc' }, { rua: 'asc' }],
    });
  }
  atualizar(
    id: string,
    user_id: string,
    data: {
      bairro?: string;
      cep?: string;
      cidade?: string;
      complemento?: string | null;
      estado?: string;
      numero?: string;
      rua?: string;
      principal?: boolean;
    },
  ) {
    return this.prisma.endereco.updateMany({
      where: { id, user_id },
      data,
    });
  }
  async definirPrincipal(id: string, user_id: string) {
    return this.prisma.$transaction(async (transaction) => {
      const endereco = await transaction.endereco.findFirst({
        where: { id, user_id },
      });
      if (!endereco) {
        throw new NotFoundException('Endereço não encontrado.');
      }
      await transaction.endereco.updateMany({
        where: { user_id, principal: true },
        data: { principal: false },
      });
      return transaction.endereco.update({
        where: { id },
        data: { principal: true },
      });
    });
  }
  deletar(id: string, user_id: string) {
    return this.prisma.endereco.deleteMany({ where: { id, user_id } });
  }
}
