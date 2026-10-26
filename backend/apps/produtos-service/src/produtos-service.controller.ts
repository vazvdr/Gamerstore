import { Controller, Get } from '@nestjs/common';
import { ProdutosServiceService } from './produtos-service.service.js';

@Controller()
export class ProdutosServiceController {
  constructor(private readonly produtosServiceService: ProdutosServiceService) {}

  @Get()
  getHello(): string {
    return this.produtosServiceService.getHello();
  }
}
