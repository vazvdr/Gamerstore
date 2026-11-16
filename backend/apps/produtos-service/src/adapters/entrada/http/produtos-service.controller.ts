import { Controller, Get, Headers, Param, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ProdutoResponse } from './dto/produto-response.dto';
import { ProdutosServiceService } from './produtos-service.service';

@Controller()
export class ProdutosServiceController {
  constructor(
    private readonly produtosService: ProdutosServiceService,
    private readonly config: ConfigService,
  ) {}

  private validarChaveInterna(key?: string): void {
    const expected = this.config.getOrThrow<string>(
      'security.internalApiKey',
    );
    if (!key || key !== expected) {
      throw new UnauthorizedException('Acesso interno não autorizado.');
    }
  }

  @Get('produtos')
  listarProdutos(@Headers('x-internal-key') key?: string): Promise<ProdutoResponse[]> {
    this.validarChaveInterna(key);
    return this.produtosService.listar();
  }

  @Get('produtos/:id')
  listarPorId(@Param('id') id: string, @Headers('x-internal-key') key?: string): Promise<ProdutoResponse> {
    this.validarChaveInterna(key);
    return this.produtosService.listarPorId(id);
  }
}