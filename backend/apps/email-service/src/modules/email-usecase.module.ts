import { Module } from '@nestjs/common';
import { EnviarEmailRecuperacaoSenhaUseCase } from '../application/usecases/enviar-email-recuperacao-senha.usecase';
import { EmailAdaptersModule } from './email-adapter.module';

@Module({
  imports: [EmailAdaptersModule],
  providers: [EnviarEmailRecuperacaoSenhaUseCase],
  exports: [EnviarEmailRecuperacaoSenhaUseCase],
})
export class EmailUseCasesModule {}
