import { Body, Controller, Get, Headers, Ip, Patch, Post, Delete, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CadastrarUsuarioDto } from './dto/cadastrar-usuario.dto';
import { EditarUsuarioDto, EditarUsuarioInput } from './dto/editar-usuario.dto';
import { LogarUsuarioDto } from './dto/logar-usuario.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { DeletarUsuarioDto, DeletarUsuarioInput } from './dto/deletar-usuario.dto';
import { InternalApiGuard } from './guards/internal-api-guard';
import { UsuarioServiceService } from './usuario-service.service';

@Controller('/usuarios')
@UseGuards(InternalApiGuard)
export class UsuarioServiceController {
  constructor(private readonly usuarioService: UsuarioServiceService) { }

  @Get()
  healthCheck() {
    return this.usuarioService.healthCheck();
  }
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
    if (!userId) {
      throw new UnauthorizedException('Identidade do usuário não informada.');
    }
    const dados: EditarUsuarioInput = { ...dto, id: userId };
    return this.usuarioService.editar(dados);
  }
  @Delete()
  deletar(@Body() dto: DeletarUsuarioDto, @Headers('x-authenticated-user-id') userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Identidade do usuário não informada.');
    }

    const dados: DeletarUsuarioInput = { ...dto, id: userId };
    return this.usuarioService.deletar(dados);
  }
}