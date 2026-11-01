import { Injectable } from '@nestjs/common';
import { CadastrarUsuarioDto } from './dto/cadastrar-usuario.dto';
import { EditarUsuarioInput } from './dto/editar-usuario.dto';
import { LogarUsuarioDto } from './dto/logar-usuario.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { DeletarUsuarioInput } from './dto/deletar-usuario.dto';
import { RecuperarSenhaDto } from './dto/recuperar-senha.dto';
import { CadastrarUsuarioUseCase } from './usecases/cadastrar-usuario.usecase';
import { EditarUsuarioUseCase } from './usecases/editar-usuario.usecase';
import { LogarUsuarioUseCase } from './usecases/logar-usuario.usecase';
import { RefreshUsuarioUseCase } from './usecases/usuario-refresh.usecase';
import { DeletarUsuarioUseCase } from './usecases/deletar-usuario.usecase';
import { RecuperarSenhaUseCase } from './usecases/recuperar-senha.usecase';

@Injectable()
export class UsuarioServiceService {
  constructor(
    private readonly cadastrarUsuario: CadastrarUsuarioUseCase,
    private readonly logarUsuario: LogarUsuarioUseCase,
    private readonly refreshUsuario: RefreshUsuarioUseCase,
    private readonly editarUsuario: EditarUsuarioUseCase,
    private readonly deletarUsuario: DeletarUsuarioUseCase,
    private readonly recuperarSenhaUsuario: RecuperarSenhaUseCase,
  ) {}

  healthCheck(): string {
    return 'Usuario Service is running';
  }
  cadastrar(dto: CadastrarUsuarioDto) {
    return this.cadastrarUsuario.execute(dto);
  }
  login(dto: LogarUsuarioDto, ip: string) {
    return this.logarUsuario.execute(dto, ip);
  }
  refresh(dto: RefreshTokenDto) {
    return this.refreshUsuario.execute(dto);
  }
  editar(dto: EditarUsuarioInput) {
    return this.editarUsuario.execute(dto);
  }
  deletar(dto: DeletarUsuarioInput) {
    return this.deletarUsuario.execute(dto);
  }
  recuperarSenha(dto: RecuperarSenhaDto) {
    return this.recuperarSenhaUsuario.execute(dto);
  }
}