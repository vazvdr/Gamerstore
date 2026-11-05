import { Body, Controller, Delete, Get, Headers, Ip, Param, Patch, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CadastrarUsuarioDto } from './dto/usuario/cadastrar-usuario.dto';
import { EditarUsuarioDto, EditarUsuarioInput } from './dto/usuario/editar-usuario.dto';
import { LogarUsuarioDto } from './dto/usuario/logar-usuario.dto';
import { RefreshTokenDto } from './dto/usuario/refresh-token.dto';
import { DeletarUsuarioDto, DeletarUsuarioInput } from './dto/usuario/deletar-usuario.dto';
import { RecuperarSenhaDto } from './dto/usuario/recuperar-senha.dto';
import { RedefinirSenhaDto } from './dto/usuario/redefinir-senha.dto';
import { CadastrarEnderecoDto, CadastrarEnderecoInput } from './dto/endereco/cadastrar-endereco.dto';
import { EditarEnderecoDto, EditarEnderecoInput } from './dto/endereco/editar-endereco.dto';
import { DeletarEnderecoDto, DeletarEnderecoInput } from './dto/endereco/deletar-endereco.dto';
import { ListarEnderecosInput } from './dto/endereco/listar-enderecos.dto';
import { InternalApiGuard } from './guards/internal-api-guard';
import { UsuarioServiceService } from './usuario-service.service';

@Controller('/usuarios')
@UseGuards(InternalApiGuard)
export class UsuarioServiceController {
  constructor(private readonly usuarioService: UsuarioServiceService) { }

  @Post('cadastro')
  cadastrar(@Body() dto: CadastrarUsuarioDto) {
    return this.usuarioService.cadastrar(dto);
  }
  @Post('login')
  login(@Body() dto: LogarUsuarioDto, @Ip() ip: string) {
    return this.usuarioService.login(dto, ip);
  }
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.usuarioService.refresh(dto);
  }
  @Patch('editar')
  editar(@Body() dto: EditarUsuarioDto, @Headers('x-authenticated-user-id') userId: string) {
    if (!userId) throw new UnauthorizedException('Identidade do usuário não informada.');
    const dados: EditarUsuarioInput = { ...dto, id: userId };
    return this.usuarioService.editar(dados);
  }
  @Delete()
  deletar(@Body() dto: DeletarUsuarioDto, @Headers('x-authenticated-user-id') userId: string) {
    if (!userId) throw new UnauthorizedException('Identidade do usuário não informada.');
    const dados: DeletarUsuarioInput = { ...dto, id: userId };
    return this.usuarioService.deletar(dados);
  }
  @Post('recuperar-senha')
  recuperarSenha(@Body() dto: RecuperarSenhaDto) {
    return this.usuarioService.recuperarSenha(dto);
  }
  @Post('redefinir-senha')
  redefinirSenha(@Body() dto: RedefinirSenhaDto) {
    return this.usuarioService.redefinirSenha(dto);
  }
  @Post('enderecos')
  cadastrarEndereco(@Body() dto: CadastrarEnderecoDto, @Headers('x-authenticated-user-id') userId: string) {
    if (!userId) throw new UnauthorizedException('Identidade do usuário não informada.');
    const dados: CadastrarEnderecoInput = { ...dto, user_id: userId };
    return this.usuarioService.cadastrarEndereco(dados);
  }
  @Get('enderecos')
  listarEnderecos(@Headers('x-authenticated-user-id') userId: string) {
    if (!userId) throw new UnauthorizedException('Identidade do usuário não informada.');
    const dados: ListarEnderecosInput = { user_id: userId };
    return this.usuarioService.listarEnderecos(dados);
  }
  @Patch('enderecos/:id')
  editarEndereco(@Param('id') id: string, @Body() dto: EditarEnderecoDto, @Headers('x-authenticated-user-id') userId: string) {
    if (!userId) throw new UnauthorizedException('Identidade do usuário não informada.');
    const dados: EditarEnderecoInput = { ...dto, id, user_id: userId };
    return this.usuarioService.editarEndereco(dados);
  }
  @Delete('enderecos')
  deletarEndereco(@Body() dto: DeletarEnderecoDto, @Headers('x-authenticated-user-id') userId: string) {
    if (!userId) throw new UnauthorizedException('Identidade do usuário não informada.');
    const dados: DeletarEnderecoInput = { ...dto, user_id: userId };
    return this.usuarioService.deletarEndereco(dados);
  }
}