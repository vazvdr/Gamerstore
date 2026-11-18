import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth-guard';
import { ProdutosUseCase } from '../../../usecases/produtos.usecase';
import { UsuariosUseCase } from '../../../usecases/usuarios.usecase';
import { EnderecosUseCase } from '../../../usecases/enderecos.usecase';
import { CarrinhoUseCase } from '../../../usecases/carrinho.usecase';
import { CadastrarUsuarioDto } from './dto/usuarios/cadastrar-usuario.dto';
import { LogarUsuarioDto } from './dto/usuarios/logar-usuario.dto';
import { RefreshTokenDto } from './dto/usuarios/refresh-token.dto';
import { EditarUsuarioDto } from './dto/usuarios/editar-usuario.dto';
import { DeletarUsuarioDto } from './dto/usuarios/deletar-usuario.dto';
import { RecuperarSenhaDto } from './dto/usuarios/recuperar-senha.dto';
import { RedefinirSenhaDto } from './dto/usuarios/redefinir-senha.dto';
import { CadastrarEnderecoDto } from './dto/endereco/cadastrar-endereco.dto';
import { EditarEnderecoDto } from './dto/endereco/editar-endereco.dto';
import { DeletarEnderecoDto } from './dto/endereco/deletar-endereco.dto';
import { AdicionarProdutoDto } from './dto/carrinho/adicionar-produto.dto';
import { SincronizarCarrinhoDto } from './dto/carrinho/sincronizar-carrinho.dto';

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
  ) { }

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
  @ApiBody({ type: CadastrarUsuarioDto })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 409, description: 'Usuário já cadastrado.' })
  cadastrarUsuario(@Body() body: CadastrarUsuarioDto) {
    return this.usuariosUseCase.cadastrarUsuario(body);
  }

  @Post('usuarios/login')
  @ApiTags('Usuários')
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiBody({ type: LogarUsuarioDto })
  @ApiResponse({ status: 201, description: 'Autenticação realizada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  loginUsuario(@Body() body: LogarUsuarioDto) {
    return this.usuariosUseCase.loginUsuario(body);
  }

  @Post('usuarios/refresh')
  @ApiTags('Usuários')
  @ApiOperation({ summary: 'Renovar tokens de autenticação' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 201, description: 'Tokens renovados com sucesso.' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido ou expirado.' })
  refreshUsuario(@Body() body: RefreshTokenDto) {
    return this.usuariosUseCase.refreshUsuario(body);
  }

  @Patch('usuarios/editar')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Usuários')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Editar dados do usuário autenticado' })
  @ApiBody({ type: EditarUsuarioDto })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  editarUsuario(@Body() body: EditarUsuarioDto, @Req() request: AuthenticatedRequest) {
    return this.usuariosUseCase.editarUsuario(body, request.user.sub);
  }

  @Delete('usuarios')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Usuários')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir conta do usuário autenticado' })
  @ApiBody({ type: DeletarUsuarioDto })
  @ApiResponse({ status: 200, description: 'Conta excluída com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado ou senha inválida.' })
  deletarUsuario(@Body() body: DeletarUsuarioDto, @Req() request: AuthenticatedRequest) {
    return this.usuariosUseCase.deletarUsuario(body, request.user.sub);
  }

  @Post('usuarios/recuperar-senha')
  @ApiTags('Usuários')
  @ApiOperation({ summary: 'Solicitar recuperação de senha' })
  @ApiBody({ type: RecuperarSenhaDto })
  @ApiResponse({ status: 201, description: 'Solicitação de recuperação processada.' })
  recuperarSenha(@Body() body: RecuperarSenhaDto) {
    return this.usuariosUseCase.recuperarSenha(body);
  }

  @Post('usuarios/redefinir-senha')
  @ApiTags('Usuários')
  @ApiOperation({ summary: 'Redefinir senha usando token de recuperação' })
  @ApiBody({ type: RedefinirSenhaDto })
  @ApiResponse({ status: 201, description: 'Senha redefinida com sucesso.' })
  @ApiResponse({ status: 400, description: 'Token inválido ou expirado.' })
  redefinirSenha(@Body() body: RedefinirSenhaDto) {
    return this.usuariosUseCase.redefinirSenha(body);
  }

  // ==================== ENDEREÇOS ====================

  @Post('usuarios/enderecos/cadastrar')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Endereços')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cadastrar endereço do usuário autenticado' })
  @ApiBody({ type: CadastrarEnderecoDto })
  @ApiResponse({ status: 201, description: 'Endereço cadastrado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  cadastrarEndereco(@Body() body: CadastrarEnderecoDto, @Req() request: AuthenticatedRequest) {
    return this.enderecosUseCase.cadastrarEndereco(body, request.user.sub);
  }

  @Get('usuarios/enderecos/listar')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Endereços')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar endereços do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Endereços retornados com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  listarEnderecos(@Req() request: AuthenticatedRequest) {
    return this.enderecosUseCase.listarEnderecos(request.user.sub);
  }

  @Patch('usuarios/enderecos/editar/:id')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Endereços')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Editar endereço do usuário autenticado' })
  @ApiParam({ name: 'id', description: 'ID do endereço', example: '1' })
  @ApiBody({ type: EditarEnderecoDto })
  @ApiResponse({ status: 200, description: 'Endereço atualizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado.' })
  editarEndereco(@Param('id') id: string, @Body() body: EditarEnderecoDto, @Req() request: AuthenticatedRequest) {
    return this.enderecosUseCase.editarEndereco(id, body, request.user.sub);
  }

  @Delete('usuarios/enderecos/excluir')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Endereços')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir endereço do usuário autenticado' })
  @ApiBody({ type: DeletarEnderecoDto })
  @ApiResponse({ status: 200, description: 'Endereço excluído com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado.' })
  deletarEndereco(@Body() body: DeletarEnderecoDto, @Req() request: AuthenticatedRequest) {
    return this.enderecosUseCase.deletarEndereco(body, request.user.sub);
  }

  // ==================== CARRINHO ====================

  @Get('carrinho/listar')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Carrinho')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar carrinho do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Carrinho retornado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  consultarCarrinho(@Req() request: AuthenticatedRequest) {
    return this.carrinhoUseCase.consultarCarrinho(request.user.sub);
  }

  @Post('carrinho/adicionar')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Carrinho')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adicionar produto ao carrinho' })
  @ApiBody({ type: AdicionarProdutoDto })
  @ApiResponse({ status: 201, description: 'Produto adicionado ao carrinho.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  adicionarProdutoCarrinho(@Body() body: AdicionarProdutoDto, @Req() request: AuthenticatedRequest) {
    return this.carrinhoUseCase.adicionarProdutoCarrinho(body, request.user.sub);
  }

  @Post('carrinho/sincronizar')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Carrinho')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sincronizar itens do carrinho' })
  @ApiBody({ type: SincronizarCarrinhoDto })
  @ApiResponse({ status: 201, description: 'Carrinho sincronizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  sincronizarCarrinho(@Body() body: SincronizarCarrinhoDto, @Req() request: AuthenticatedRequest) {
    return this.carrinhoUseCase.sincronizarCarrinho(body, request.user.sub);
  }

  @Patch('carrinho/:produtoId/aumentar')
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

  @Patch('carrinho/:produtoId/diminuir')
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

  @Delete('carrinho/:produtoId/remover')
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

  @Delete('carrinho/limpar')
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
