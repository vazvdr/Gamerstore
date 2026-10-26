
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { ApiGatewayService } from './api-gateway.service';

@Controller('produtos')
@UseGuards(ThrottlerGuard)
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get()
  listar() {
    return this.apiGatewayService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.apiGatewayService.buscarPorId(id);
  }
}
