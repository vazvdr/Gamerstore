import { Module } from '@nestjs/common';
import { UsuarioAdaptersModule } from './usuario-adapters.module';

import { CadastrarUsuarioUseCase } from '../application/usecases/usuarios/cadastrar-usuario.usecase';
import { EditarUsuarioUseCase } from '../application/usecases/usuarios/editar-usuario.usecase';
import { LogarUsuarioUseCase } from '../application/usecases/usuarios/logar-usuario.usecase';
import { RefreshUsuarioUseCase } from '../application/usecases/usuarios/usuario-refresh.usecase';
import { DeletarUsuarioUseCase } from '../application/usecases/usuarios/deletar-usuario.usecase';
import { RecuperarSenhaUseCase } from '../application/usecases/usuarios/recuperar-senha.usecase';
import { RedefinirSenhaUseCase } from '../application/usecases/usuarios/redefinir-senha.usecase';

import { CadastrarEnderecoUseCase } from '../application/usecases/enderecos/cadastrar-endereco.usecase';
import { EditarEnderecoUseCase } from '../application/usecases/enderecos/editar-endereco.usecase';
import { DeletarEnderecoUseCase } from '../application/usecases/enderecos/deletar-endereco.usecase';
import { ListarEnderecosUseCase } from '../application/usecases/enderecos/listar-enderecos.usecase';

@Module({
  imports: [UsuarioAdaptersModule],
  providers: [
    CadastrarUsuarioUseCase,
    EditarUsuarioUseCase,
    LogarUsuarioUseCase,
    RefreshUsuarioUseCase,
    DeletarUsuarioUseCase,
    RecuperarSenhaUseCase,
    RedefinirSenhaUseCase,
    CadastrarEnderecoUseCase,
    EditarEnderecoUseCase,
    DeletarEnderecoUseCase,
    ListarEnderecosUseCase,
  ],
  exports: [
    CadastrarUsuarioUseCase,
    EditarUsuarioUseCase,
    LogarUsuarioUseCase,
    RefreshUsuarioUseCase,
    DeletarUsuarioUseCase,
    RecuperarSenhaUseCase,
    RedefinirSenhaUseCase,
    CadastrarEnderecoUseCase,
    EditarEnderecoUseCase,
    DeletarEnderecoUseCase,
    ListarEnderecosUseCase,
  ],
})
export class UsuarioUseCasesModule {}