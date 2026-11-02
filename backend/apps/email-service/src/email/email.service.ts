
import { Injectable, Logger } from '@nestjs/common';
import { BrevoService } from './brevo.service';
import { recuperarSenhaTemplate } from './templates/recuperar-senha.template';

interface RecuperarSenhaEmail {
  nome: string;
  email: string;
  link: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly brevo: BrevoService) {}

  async enviarRecuperacaoSenha(dados: RecuperarSenhaEmail): Promise<void> {
    const htmlContent = recuperarSenhaTemplate({
      nome: dados.nome,
      link: dados.link,
    });

    await this.brevo.enviarEmail({
      to: [{ name: dados.nome, email: dados.email }],
      subject: 'Recuperação de senha | GamerStore',
      htmlContent,
    });

    this.logger.log(`E-mail de recuperação enviado para ${dados.email}.`);
  }
}
