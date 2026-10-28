import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { ApiGatewayService } from './api-gateway.service';

@Controller()
@UseGuards(ThrottlerGuard)
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get('produtos')
  listar() {
    return this.apiGatewayService.listar();
  }
  @Get('produtos/:id')
  buscarPorId(@Param('id') id: string) {
    return this.apiGatewayService.buscarPorId(id);
  }
  @Post('usuarios/cadastro')
  cadastrarUsuario(@Body() body: unknown) {
    return this.apiGatewayService.cadastrarUsuario(body);
  }
  @Post('usuarios/login')
  loginUsuario(@Body() body: unknown) {
    return this.apiGatewayService.loginUsuario(body);
  }
}