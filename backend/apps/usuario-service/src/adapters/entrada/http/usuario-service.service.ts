
import { Injectable } from '@nestjs/common';
import { CadastrarUsuarioDto } from './dto/usuario/cadastrar-usuario.dto';
import { EditarUsuarioInput } from './dto/usuario/editar-usuario.dto';
import { LogarUsuarioDto } from './dto/usuario/logar-usuario.dto';
import { RefreshTokenDto } from './dto/usuario/refresh-token.dto';
import { DeletarUsuarioInput } from './dto/usuario/deletar-usuario.dto';
import { RecuperarSenhaDto } from './dto/usuario/recuperar-senha.dto';
import { RedefinirSenhaDto } from './dto/usuario/redefinir-senha.dto';
import { CadastrarEnderecoInput } from './dto/endereco/cadastrar-endereco.dto';
import { EditarEnderecoInput } from './dto/endereco/editar-endereco.dto';
import { DeletarEnderecoInput } from './dto/endereco/deletar-endereco.dto';
import { ListarEnderecosInput } from './dto/endereco/listar-enderecos.dto';
import { CadastrarUsuarioUseCase } from '../../../application/usecases/usuarios/cadastrar-usuario.usecase';
import { EditarUsuarioUseCase } from '../../../application/usecases/usuarios/editar-usuario.usecase';
import { LogarUsuarioUseCase } from '../../../application/usecases/usuarios/logar-usuario.usecase';
import { RefreshUsuarioUseCase } from '../../../application/usecases/usuarios/usuario-refresh.usecase';
import { DeletarUsuarioUseCase } from '../../../application/usecases/usuarios/deletar-usuario.usecase';
import { RecuperarSenhaUseCase } from '../../../application/usecases/usuarios/recuperar-senha.usecase';
import { RedefinirSenhaUseCase } from '../../../application/usecases/usuarios/redefinir-senha.usecase';
import { CadastrarEnderecoUseCase } from '../../../application/usecases/enderecos/cadastrar-endereco.usecase';
import { EditarEnderecoUseCase } from '../../../application/usecases/enderecos/editar-endereco.usecase';
import { DeletarEnderecoUseCase } from '../../../application/usecases/enderecos/deletar-endereco.usecase';
import { ListarEnderecosUseCase } from '../../../application/usecases/enderecos/listar-enderecos.usecase';

@Injectable()
export class UsuarioServiceService {
  constructor(
    private readonly cadastrarUsuario: CadastrarUsuarioUseCase,
    private readonly logarUsuario: LogarUsuarioUseCase,
    private readonly refreshUsuario: RefreshUsuarioUseCase,
    private readonly editarUsuario: EditarUsuarioUseCase,
    private readonly deletarUsuario: DeletarUsuarioUseCase,
    private readonly recuperarSenhaUsuario: RecuperarSenhaUseCase,
    private readonly redefinirSenhaUsuario: RedefinirSenhaUseCase,
    private readonly cadastrarEnderecoUseCase: CadastrarEnderecoUseCase,
    private readonly editarEnderecoUseCase: EditarEnderecoUseCase,
    private readonly deletarEnderecoUseCase: DeletarEnderecoUseCase,
    private readonly listarEnderecosUseCase: ListarEnderecosUseCase,
  ) { }

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
  redefinirSenha(dto: RedefinirSenhaDto) {
    return this.redefinirSenhaUsuario.execute(dto);
  }
  cadastrarEndereco(dto: CadastrarEnderecoInput) {
    return this.cadastrarEnderecoUseCase.execute(dto);
  }
  editarEndereco(dto: EditarEnderecoInput) {
    return this.editarEnderecoUseCase.execute(dto);
  }
  deletarEndereco(dto: DeletarEnderecoInput) {
    return this.deletarEnderecoUseCase.execute(dto);
  }
  listarEnderecos(dto: ListarEnderecosInput) {
    return this.listarEnderecosUseCase.execute(dto);
  }
}
