import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiGatewayService } from './api-gateway.service';
import { JwtAuthGuard } from './guards/jwt-auth-guard';

@Controller()
@UseGuards(ThrottlerGuard)
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) { }

  @Get('produtos')
  listarProdutos() {
    return this.apiGatewayService.listarProdutos();
  }
  @Get('produtos/:id')
  listarPorId(@Param('id') id: string) {
    return this.apiGatewayService.listarProdutosPorId(id);
  }
  @Post('usuarios/cadastro')
  cadastrarUsuario(@Body() body: unknown) {
    return this.apiGatewayService.cadastrarUsuario(body);
  }
  @Post('usuarios/login')
  loginUsuario(@Body() body: unknown) {
    return this.apiGatewayService.loginUsuario(body);
  }
  @Post('usuarios/refresh')
  refreshUsuario(@Body() body: { refreshToken: string }) {
    return this.apiGatewayService.refreshUsuario(body);
  }
  @Patch('/usuarios/editar')
  @UseGuards(JwtAuthGuard)
  editarUsuario(@Body() body: Record<string, unknown>, @Req() request: { user: { sub: string; email: string } }) {
    return this.apiGatewayService.editarUsuario(body, request.user.sub);
  }
  @Delete('usuarios')
  @UseGuards(JwtAuthGuard)
  deletarUsuario(@Body() body: { senhaAtual: string }, @Req() request:{ user: { sub: string; email: string }}) {
    return this.apiGatewayService.deletarUsuario(body, request.user.sub);
  }
}