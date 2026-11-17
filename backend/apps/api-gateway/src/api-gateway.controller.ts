
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
  deletarUsuario(@Body() body: { senhaAtual: string }, @Req() request: { user: { sub: string; email: string } }) {
    return this.apiGatewayService.deletarUsuario(body, request.user.sub);
  }
  @Post('usuarios/recuperar-senha')
  recuperarSenha(@Body() body: { email: string }) {
    return this.apiGatewayService.recuperarSenha(body);
  }
  @Post('usuarios/redefinir-senha')
  redefinirSenha(@Body() body: { token: string; senha: string }) {
    return this.apiGatewayService.redefinirSenha(body);
  }
  @Post('usuarios/enderecos')
  @UseGuards(JwtAuthGuard)
  cadastrarEndereco(@Body() body: unknown, @Req() request: { user: { sub: string; email: string } }) {
    return this.apiGatewayService.cadastrarEndereco(body, request.user.sub);
  }
  @Get('usuarios/enderecos')
  @UseGuards(JwtAuthGuard)
  listarEnderecos(@Req() request: { user: { sub: string; email: string } }) {
    return this.apiGatewayService.listarEnderecos(request.user.sub);
  }
  @Patch('usuarios/enderecos/:id')
  @UseGuards(JwtAuthGuard)
  editarEndereco(@Param('id') id: string, @Body() body: unknown, @Req() request: { user: { sub: string; email: string } }) {
    return this.apiGatewayService.editarEndereco(id, body, request.user.sub);
  }
  @Delete('usuarios/enderecos')
  @UseGuards(JwtAuthGuard)
  deletarEndereco(@Body() body: { id: string }, @Req() request: { user: { sub: string; email: string } }) {
    return this.apiGatewayService.deletarEndereco(body, request.user.sub);
  }
  @Get('carrinho')
  @UseGuards(JwtAuthGuard)
  consultarCarrinho(@Req() request: { user: { sub: string; email: string } }) {
    return this.apiGatewayService.consultarCarrinho(request.user.sub);
  }
  @Post('carrinho/itens')
  @UseGuards(JwtAuthGuard)
  adicionarProdutoCarrinho(@Body() body: { produtoId: string; quantidade: number }, @Req() request: { user: { sub: string; email: string } }) {
    return this.apiGatewayService.adicionarProdutoCarrinho(body, request.user.sub);
  }
  @Post('carrinho/sincronizar')
  @UseGuards(JwtAuthGuard)
  sincronizarCarrinho(@Body() body: { itens: { produtoId: string; quantidade: number }[] }, @Req() request: { user: { sub: string; email: string } }) {
    return this.apiGatewayService.sincronizarCarrinho(body, request.user.sub);
  }
  @Patch('carrinho/itens/:produtoId/aumentar')
  @UseGuards(JwtAuthGuard)
  aumentarQuantidadeProduto(@Param('produtoId') produtoId: string, @Req() request: { user: { sub: string; email: string } }) {
    return this.apiGatewayService.aumentarQuantidadeProduto(produtoId, request.user.sub);
  }
  @Patch('carrinho/itens/:produtoId/diminuir')
  @UseGuards(JwtAuthGuard)
  diminuirQuantidadeProduto(@Param('produtoId') produtoId: string, @Req() request: { user: { sub: string; email: string } }) {
    return this.apiGatewayService.diminuirQuantidadeProduto(produtoId, request.user.sub);
  }
  @Delete('carrinho/itens/:produtoId')
  @UseGuards(JwtAuthGuard)
  excluirProdutoCarrinho(@Param('produtoId') produtoId: string, @Req() request: { user: { sub: string; email: string } }) {
    return this.apiGatewayService.excluirProdutoCarrinho(produtoId, request.user.sub);
  }
  @Delete('carrinho')
  @UseGuards(JwtAuthGuard)
  limparCarrinho(@Req() request: { user: { sub: string; email: string } }) {
    return this.apiGatewayService.limparCarrinho(request.user.sub);
  }
}
