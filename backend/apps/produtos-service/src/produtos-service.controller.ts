
import { Controller, Get, Param } from '@nestjs/common';

import { ProdutoResponse } from './dto/ProdutoResponseDto';
import { ProdutosServiceService } from './produtos-service.service';

@Controller()
export class ProdutosServiceController {
  constructor(private readonly produtosServiceService: ProdutosServiceService) {}

  @Get('produtos')
  listar(): Promise<ProdutoResponse[]> {
    return this.produtosServiceService.listar();
  }

  @Get('produtos/:id')
  buscarPorId(@Param('id') id: string): Promise<ProdutoResponse> {
    return this.produtosServiceService.buscarPorId(id);
  }
}
