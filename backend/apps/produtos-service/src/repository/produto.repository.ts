
import { Injectable } from '@nestjs/common';

import { ProdutoResponse } from '../dto/ProdutoResponseDto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProdutoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<ProdutoResponse[]> {
    const produtos = await this.prisma.product.findMany({
      orderBy: { id: 'asc' },
    });

    return produtos.map((produto) => ({
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
    }));
  }

  async buscarPorId(id: string): Promise<ProdutoResponse | null> {
    const produto = await this.prisma.product.findUnique({
      where: { id: BigInt(id) },
    });

    if (!produto) return null;

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
