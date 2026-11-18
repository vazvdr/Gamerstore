import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { ProdutosUseCase } from './usecases/produtos.usecase';
import { UsuariosUseCase } from './usecases/usuarios.usecase';
import { EnderecosUseCase } from './usecases/enderecos.usecase';
import { CarrinhoUseCase } from './usecases/carrinho.usecase';

interface AuthenticatedRequest {
  user: {
    sub: string;
    email: string;
  };
}

@Controller()
@UseGuards(ThrottlerGuard)
export class ApiGatewayController {
  constructor(
    private readonly produtosUseCase: ProdutosUseCase,
    private readonly usuariosUseCase: UsuariosUseCase,
    private readonly enderecosUseCase: EnderecosUseCase,
    private readonly carrinhoUseCase: CarrinhoUseCase,
  ) {}

  // ==================== PRODUTOS ====================

  @Get('produtos')
  @ApiTags('Produtos')
  @ApiOperation({ summary: 'Listar todos os produtos' })
  @ApiResponse({ status: 200, description: 'Lista de produtos retornada com sucesso.' })
  @ApiResponse({ status: 502, description: 'Serviço de produtos indisponível.' })
  listarProdutos() {
    return this.produtosUseCase.listarProdutos();
  }

  @Get('produtos/:id')
  @ApiTags('Produtos')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiParam({ name: 'id', description: 'ID do produto', example: '1' })
  @ApiResponse({ status: 200, description: 'Produto encontrado.' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  @ApiResponse({ status: 502, description: 'Serviço de produtos indisponível.' })
  listarPorId(@Param('id') id: string) {
    return this.produtosUseCase.listarProdutosPorId(id);
  }

  // ==================== USUÁRIOS ====================

  @Post('usuarios/cadastro')
  @ApiTags('Usuários')
  @ApiOperation({ summary: 'Cadastrar usuário' })
  @ApiBody({ schema: { type: 'object', additionalProperties: true } })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 409, description: 'Usuário já cadastrado.' })
  cadastrarUsuario(@Body() body: unknown) {
    return this.usuariosUseCase.cadastrarUsuario(body);
  }

  @Post('usuarios/login')
  @ApiTags('Usuários')
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiBody({ schema: { type: 'object', additionalProperties: true } })
  @ApiResponse({ status: 201, description: 'Autenticação realizada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  loginUsuario(@Body() body: unknown) {
    return this.usuariosUseCase.loginUsuario(body);
  }

  @Post('usuarios/refresh')
  @ApiTags('Usuários')
  @ApiOperation({ summary: 'Renovar tokens de autenticação' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { refreshToken: { type: 'string', example: 'seu-refresh-token' } },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({ status: 201, description: 'Tokens renovados com sucesso.' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido ou expirado.' })
  refreshUsuario(@Body() body: { refreshToken: string }) {
    return this.usuariosUseCase.refreshUsuario(body);
  }

  @Patch('usuarios/editar')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Usuários')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Editar dados do usuário autenticado' })
  @ApiBody({ schema: { type: 'object', additionalProperties: true } })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  editarUsuario(@Body() body: Record<string, unknown>, @Req() request: AuthenticatedRequest) {
    return this.usuariosUseCase.editarUsuario(body, request.user.sub);
  }

  @Delete('usuarios')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Usuários')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir conta do usuário autenticado' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { senhaAtual: { type: 'string', example: 'Senha@123' } },
      required: ['senhaAtual'],
    },
  })
  @ApiResponse({ status: 200, description: 'Conta excluída com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado ou senha inválida.' })
  deletarUsuario(@Body() body: { senhaAtual: string }, @Req() request: AuthenticatedRequest) {
    return this.usuariosUseCase.deletarUsuario(body, request.user.sub);
  }

  @Post('usuarios/recuperar-senha')
  @ApiTags('Usuários')
  @ApiOperation({ summary: 'Solicitar recuperação de senha' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', format: 'email', example: 'usuario@email.com' } },
      required: ['email'],
    },
  })
  @ApiResponse({ status: 201, description: 'Solicitação de recuperação processada.' })
  recuperarSenha(@Body() body: { email: string }) {
    return this.usuariosUseCase.recuperarSenha(body);
  }

  @Post('usuarios/redefinir-senha')
  @ApiTags('Usuários')
  @ApiOperation({ summary: 'Redefinir senha usando token de recuperação' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'token-de-recuperacao' },
        senha: { type: 'string', example: 'NovaSenha@123' },
      },
      required: ['token', 'senha'],
    },
  })
  @ApiResponse({ status: 201, description: 'Senha redefinida com sucesso.' })
  @ApiResponse({ status: 400, description: 'Token inválido ou expirado.' })
  redefinirSenha(@Body() body: { token: string; senha: string }) {
    return this.usuariosUseCase.redefinirSenha(body);
  }

  // ==================== ENDEREÇOS ====================

  @Post('usuarios/enderecos')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Endereços')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cadastrar endereço do usuário autenticado' })
  @ApiBody({ schema: { type: 'object', additionalProperties: true } })
  @ApiResponse({ status: 201, description: 'Endereço cadastrado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  cadastrarEndereco(@Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.enderecosUseCase.cadastrarEndereco(body, request.user.sub);
  }

  @Get('usuarios/enderecos')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Endereços')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar endereços do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Endereços retornados com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  listarEnderecos(@Req() request: AuthenticatedRequest) {
    return this.enderecosUseCase.listarEnderecos(request.user.sub);
  }

  @Patch('usuarios/enderecos/:id')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Endereços')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Editar endereço do usuário autenticado' })
  @ApiParam({ name: 'id', description: 'ID do endereço', example: '1' })
  @ApiBody({ schema: { type: 'object', additionalProperties: true } })
  @ApiResponse({ status: 200, description: 'Endereço atualizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado.' })
  editarEndereco(@Param('id') id: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.enderecosUseCase.editarEndereco(id, body, request.user.sub);
  }

  @Delete('usuarios/enderecos')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Endereços')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir endereço do usuário autenticado' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { id: { type: 'string', example: '1' } },
      required: ['id'],
    },
  })
  @ApiResponse({ status: 200, description: 'Endereço excluído com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado.' })
  deletarEndereco(@Body() body: { id: string }, @Req() request: AuthenticatedRequest) {
    return this.enderecosUseCase.deletarEndereco(body, request.user.sub);
  }

  // ==================== CARRINHO ====================

  @Get('carrinho')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Carrinho')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar carrinho do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Carrinho retornado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  consultarCarrinho(@Req() request: AuthenticatedRequest) {
    return this.carrinhoUseCase.consultarCarrinho(request.user.sub);
  }

  @Post('carrinho/itens')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Carrinho')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adicionar produto ao carrinho' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        produtoId: { type: 'string', example: '1' },
        quantidade: { type: 'number', example: 2 },
      },
      required: ['produtoId', 'quantidade'],
    },
  })
  @ApiResponse({ status: 201, description: 'Produto adicionado ao carrinho.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  adicionarProdutoCarrinho(@Body() body: { produtoId: string; quantidade: number }, @Req() request: AuthenticatedRequest) {
    return this.carrinhoUseCase.adicionarProdutoCarrinho(body, request.user.sub);
  }

  @Post('carrinho/sincronizar')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Carrinho')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sincronizar itens do carrinho' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        itens: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              produtoId: { type: 'string', example: '1' },
              quantidade: { type: 'number', example: 2 },
            },
            required: ['produtoId', 'quantidade'],
          },
        },
      },
      required: ['itens'],
    },
  })
  @ApiResponse({ status: 201, description: 'Carrinho sincronizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  sincronizarCarrinho(@Body() body: { itens: { produtoId: string; quantidade: number }[] }, @Req() request: AuthenticatedRequest) {
    return this.carrinhoUseCase.sincronizarCarrinho(body, request.user.sub);
  }

  @Patch('carrinho/itens/:produtoId/aumentar')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Carrinho')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aumentar quantidade de um produto no carrinho' })
  @ApiParam({ name: 'produtoId', description: 'ID do produto', example: '1' })
  @ApiResponse({ status: 200, description: 'Quantidade aumentada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  aumentarQuantidadeProduto(@Param('produtoId') produtoId: string, @Req() request: AuthenticatedRequest) {
    return this.carrinhoUseCase.aumentarQuantidadeProduto(produtoId, request.user.sub);
  }

  @Patch('carrinho/itens/:produtoId/diminuir')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Carrinho')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Diminuir quantidade de um produto no carrinho' })
  @ApiParam({ name: 'produtoId', description: 'ID do produto', example: '1' })
  @ApiResponse({ status: 200, description: 'Quantidade diminuída com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  diminuirQuantidadeProduto(@Param('produtoId') produtoId: string, @Req() request: AuthenticatedRequest) {
    return this.carrinhoUseCase.diminuirQuantidadeProduto(produtoId, request.user.sub);
  }

  @Delete('carrinho/itens/:produtoId')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Carrinho')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover produto do carrinho' })
  @ApiParam({ name: 'produtoId', description: 'ID do produto', example: '1' })
  @ApiResponse({ status: 200, description: 'Produto removido do carrinho.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  excluirProdutoCarrinho(@Param('produtoId') produtoId: string, @Req() request: AuthenticatedRequest) {
    return this.carrinhoUseCase.excluirProdutoCarrinho(produtoId, request.user.sub);
  }

  @Delete('carrinho')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Carrinho')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Limpar carrinho do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Carrinho limpo com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  limparCarrinho(@Req() request: AuthenticatedRequest) {
    return this.carrinhoUseCase.limparCarrinho(request.user.sub);
  }
}
