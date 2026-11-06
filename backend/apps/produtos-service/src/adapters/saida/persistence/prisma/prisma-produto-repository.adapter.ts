import { Injectable } from '@nestjs/common';

import type { Produto } from '../../../../domain/entities/produto';
import type { ProdutoRepositorioPorta } from '../../../../application/ports/saida/produto-repository.ports';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaProdutoRepositoryAdapter implements ProdutoRepositorioPorta {
  constructor(private readonly prisma: PrismaService) {}

  async listarProdutos(): Promise<Produto[]> {
    const produtos = await this.prisma.product.findMany({
      orderBy: { id: 'asc' },
    });

    return produtos.map((produto) => this.mapearProduto(produto));
  }

  async listarPorId(id: string): Promise<Produto | null> {
    const produto = await this.prisma.product.findUnique({
      where: { id: BigInt(id) },
    });

    if (!produto) {
      return null;
    }

    return this.mapearProduto(produto);
  }

  private mapearProduto(produto: {
    id: bigint;
    brand: string;
    description: string | null;
    image_url: string | null;
    model: string;
    name: string;
    price: { toString(): string };
    stock: number;
    specifications: string | null;
    tags: string | null;
    reserved_stock: number | null;
  }): Produto {
    return {
      id: produto.id.toString(),
      brand: produto.brand,
      description: produto.description,
      imageUrl: produto.image_url,
      model: produto.model,
      name: produto.name,
      price: produto.price.toString(),
      stock: produto.stock,
      specifications: produto.specifications,
      tags: produto.tags,
      reservedStock: produto.reserved_stock,
    };
  }
}