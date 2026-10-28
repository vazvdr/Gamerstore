import { Body, Controller, Get, Ip, Post, UseGuards } from '@nestjs/common';

import { CadastrarUsuarioDto } from './dto/cadastrar-usuario.dto';
import { LogarUsuarioDto } from './dto/logar-usuario.dto';
import { InternalApiGuard } from './guards/internal-api-guard';
import { CadastrarUsuarioUseCase } from './usecases/cadastrar-usuario.usecase';
import { LogarUsuarioUseCase } from './usecases/logar-usuario.usecase';
import { UsuarioServiceService } from './usuario-service.service';

@Controller('/usuarios')
@UseGuards(InternalApiGuard)
export class UsuarioServiceController {
  logarUsuarioUseCase: any;
  constructor(
    private readonly usuarioService: UsuarioServiceService,
    private readonly cadastrarUsuario: CadastrarUsuarioUseCase,
    private readonly logarUsuario: LogarUsuarioUseCase,
  ) { }

  @Get()
  healthCheck() {
    return this.usuarioService.healthCheck();
  }
  @Post('cadastro')
  cadastrar(@Body() dto: CadastrarUsuarioDto) {
    return this.cadastrarUsuario.execute(dto);
  }
  @Post('login')
  login(@Body() dto: LogarUsuarioDto, @Ip() ip: string) {
    return this.logarUsuarioUseCase.execute(dto, ip);
  }
}