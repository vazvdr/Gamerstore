import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface BrevoEmailPayload {
  sender: { name: string; email: string };
  to: { name: string; email: string }[];
  subject: string;
  htmlContent: string;
}
interface BrevoEmailResponse {
  messageId?: string;
}
@Injectable()
export class BrevoService {
  private readonly logger = new Logger(BrevoService.name);
  private readonly apiUrl = 'https://api.brevo.com/v3/smtp/email';

  constructor(private readonly config: ConfigService) {}

  async enviarEmail(payload: Omit<BrevoEmailPayload, 'sender'>): Promise<string | undefined> {
    const apiKey = this.config.get<string>('BREVO_API_KEY');
    const senderEmail = this.config.get<string>('BREVO_SENDER_EMAIL');
    const senderName = this.config.get<string>('BREVO_SENDER_NAME', 'GamerStore');

    if (!apiKey || !senderEmail) {
      throw new InternalServerErrorException('Configuração da Brevo não encontrada.');
    }
    const body: BrevoEmailPayload = {
      sender: { name: senderName, email: senderEmail },
      ...payload,
    };
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Falha no envio pela Brevo (${response.status}): ${error}`);
      throw new InternalServerErrorException('Não foi possível enviar o e-mail.');
    }
    const result = await response.json() as BrevoEmailResponse;
    this.logger.log(`E-mail enviado pela Brevo: ${result.messageId ?? 'sem ID retornado'}`);
    return result.messageId;
  }
}
