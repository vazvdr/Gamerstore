import { Inject, Injectable, Logger } from '@nestjs/common';
import { EMAIL_SENDER, type EmailSenderPort } from '../ports/saida/email-sender.port.js';
import { recuperarSenhaTemplate } from '../templates/recuperar-senha.template.js';

export interface RecuperacaoSenhaEmail {
  nome: string;
  email: string;
  link: string;
}

@Injectable()
export class EnviarEmailRecuperacaoSenhaUseCase {
  private readonly logger = new Logger(EnviarEmailRecuperacaoSenhaUseCase.name);

  constructor(
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSenderPort,
  ) {}

  async execute(dados: RecuperacaoSenhaEmail): Promise<void> {
    const htmlContent = recuperarSenhaTemplate({
      nome: dados.nome,
      link: dados.link,
    });
    await this.emailSender.enviarEmail({
      to: [{ name: dados.nome, email: dados.email }],
      subject: 'Recuperação de senha | GamerStore',
      htmlContent,
    });
    this.logger.log(`E-mail de recuperação enviado para ${dados.email}.`);
  }
}