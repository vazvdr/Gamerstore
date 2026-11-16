import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type {
  EmailSenderPayload,
  EmailSenderPort,
} from '../../../../application/ports/saida/email-sender.port';

interface BrevoEmailPayload extends EmailSenderPayload {
  sender: {
    name: string;
    email: string;
  };
}

interface BrevoEmailResponse {
  messageId?: string;
}

@Injectable()
export class BrevoEmailAdapter implements EmailSenderPort {
  private readonly logger = new Logger(BrevoEmailAdapter.name);
  private readonly apiUrl = 'https://api.brevo.com/v3/smtp/email';

  constructor(private readonly config: ConfigService) {}
  async enviarEmail(
    payload: EmailSenderPayload,
  ): Promise<string | undefined> {
    const apiKey = this.config.getOrThrow<string>('brevo.apiKey');
    const senderEmail = this.config.getOrThrow<string>('brevo.senderEmail');
    const senderName = this.config.getOrThrow<string>('brevo.senderName');
    const body: BrevoEmailPayload = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
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
      this.logger.error(
        `Falha no envio pela Brevo (${response.status}): ${error}`,
      );
      throw new InternalServerErrorException(
        'Não foi possível enviar o e-mail.',
      );
    }
    const result = (await response.json()) as BrevoEmailResponse;
    this.logger.log(
      `E-mail enviado pela Brevo: ${result.messageId ?? 'sem ID retornado'}`,
    );
    return result.messageId;
  }
}
