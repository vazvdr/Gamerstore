
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BrevoEmailAdapter } from '../../../../../adapters/saida/notifications/email/brevo-email.adapter';
import type { EmailSenderPayload } from '../../../../../application/ports/saida/email-sender.port';

describe('BrevoEmailAdapter', () => {
  let adapter: BrevoEmailAdapter;
  let config: { getOrThrow: ReturnType<typeof vi.fn> };

  const payload: EmailSenderPayload = {
    to: [{ name: 'Joazinho', email: 'joazinho@example.com' }],
    subject: 'Recuperação de senha | GamerStore',
    htmlContent: '<html>Recuperação de senha</html>',
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    config = {
      getOrThrow: vi.fn((key: string) => {
        const values: Record<string, string> = {
          'brevo.apiKey': 'api-key-teste',
          'brevo.senderEmail': 'noreply@gamerstore.com',
          'brevo.senderName': 'GamerStore',
        };

        if (!(key in values)) {
          throw new Error(`Configuração não encontrada: ${key}`);
        }

        return values[key];
      }),
    };

    adapter = new BrevoEmailAdapter(config as unknown as ConfigService);
  });

  it('deve enviar o e-mail com as configurações e payload corretos', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ messageId: 'brevo-message-123' }), {
        status: 201,
      }),
    );
    const resultado = await adapter.enviarEmail(payload);
    expect(config.getOrThrow).toHaveBeenCalledWith('brevo.apiKey');
    expect(config.getOrThrow).toHaveBeenCalledWith('brevo.senderEmail');
    expect(config.getOrThrow).toHaveBeenCalledWith('brevo.senderName');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.brevo.com/v3/smtp/email',
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': 'api-key-teste',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: 'GamerStore',
            email: 'noreply@gamerstore.com',
          },
          ...payload,
        }),
      },
    );
    expect(resultado).toBe('brevo-message-123');
  });

  it('deve retornar undefined quando a Brevo não retornar messageId', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({}), { status: 201 }),
    );
    const resultado = await adapter.enviarEmail(payload);
    expect(resultado).toBeUndefined();
  });

  it('deve lançar InternalServerErrorException quando a Brevo retornar erro', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Erro de autenticação', { status: 401 }),
    );
    await expect(adapter.enviarEmail(payload)).rejects.toThrow(
      InternalServerErrorException,
    );
  });


  it('deve propagar erro quando uma configuração não estiver disponível', async () => {
    const error = new Error('Configuração não encontrada');
    config.getOrThrow.mockImplementation((key: string) => {
      if (key === 'brevo.apiKey') throw error;
      return 'valor-configurado';
    });
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await expect(
      adapter.enviarEmail({
        to: [{ name: 'Joazinho', email: 'joazinho@example.com' }],
        subject: 'Teste',
        htmlContent: '<p>Teste</p>',
      }),
    ).rejects.toThrow(error);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

});
