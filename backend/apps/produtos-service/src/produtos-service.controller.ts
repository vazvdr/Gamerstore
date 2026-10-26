import { Controller, Get, Headers, Param, UnauthorizedException } from '@nestjs/common';

import { ProdutoResponse } from './dto/ProdutoResponseDto';
import { ProdutosServiceService } from './produtos-service.service';

@Controller()
export class ProdutosServiceController {
  constructor(private readonly produtosServiceService: ProdutosServiceService) {}

  private validarChaveInterna(key?: string): void {
    const expected = process.env.INTERNAL_API_KEY;

    if (!key || !expected || key !== expected) {
      throw new UnauthorizedException('Acesso interno não autorizado.');
    }
  }

  @Get('produtos')
  listar(@Headers('x-internal-key') key?: string): Promise<ProdutoResponse[]> {
    this.validarChaveInterna(key);
    return this.produtosServiceService.listar();
  }

  @Get('produtos/:id')
  buscarPorId(
    @Param('id') id: string,
    @Headers('x-internal-key') key?: string,
  ): Promise<ProdutoResponse> {
    this.validarChaveInterna(key);
    return this.produtosServiceService.buscarPorId(id);
  }
}