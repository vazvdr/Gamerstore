import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { EnderecoRepositorioPorta, CriarEnderecoDados, AtualizarEnderecoDados } from '../../../../application/ports/saida/endereco-repository.ports';
import { Endereco } from '../../../../domain/entities/endereco';

@Injectable()
export class PrismaEnderecoRepositoryAdapter implements EnderecoRepositorioPorta {
  constructor(private readonly prisma: PrismaService) {}

  async criar(data: CriarEnderecoDados): Promise<Endereco> {
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
  async buscarPorId(id: string, user_id: string): Promise<Endereco | null> {
    return this.prisma.endereco.findFirst({ where: { id, user_id } });
  }
  async listarPorUsuario(user_id: string): Promise<Endereco[]> {
    return this.prisma.endereco.findMany({
      where: { user_id },
      orderBy: [{ principal: 'desc' }, { rua: 'asc' }],
    });
  }
  async atualizar(id: string, user_id: string, data: AtualizarEnderecoDados): Promise<{ count: number }> {
    return this.prisma.endereco.updateMany({
      where: { id, user_id },
      data,
    });
  }
  async definirPrincipal(id: string, user_id: string): Promise<Endereco> {
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
  async deletar(id: string, user_id: string): Promise<{ count: number }> {
    return this.prisma.endereco.deleteMany({
      where: { id, user_id },
    });
  }
}