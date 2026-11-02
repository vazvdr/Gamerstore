import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Channel, ConsumeMessage } from 'amqplib';
import { EmailService } from '../email/email.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

interface RecuperarSenhaMessage {
  usuarioId: string;
  nome: string;
  email: string;
  link: string;
}

interface RecuperarSenhaEvent {
  pattern: 'usuario-recuperar-senha';
  data: RecuperarSenhaMessage;
}

@Injectable()
export class RecuperarSenhaConsumer implements OnModuleInit {
  private readonly logger = new Logger(RecuperarSenhaConsumer.name);

  constructor(
    private readonly rabbitMQ: RabbitMQService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) { }

  async onModuleInit(): Promise<void> {
    const queue = this.config.get<string>(
      'RABBITMQ_RECUPERAR_SENHA_QUEUE',
      'usuario-recuperar-senha',
    );
    const dlx = `${queue}.dlx`;
    const dlq = `${queue}.dlq`;
    const channel = await this.rabbitMQ.getChannel();
    await channel.assertExchange(dlx, 'direct', { durable: true });
    await channel.assertQueue(dlq, { durable: true });
    await channel.bindQueue(dlq, dlx, dlq);
    await channel.assertQueue(queue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': dlx,
        'x-dead-letter-routing-key': dlq,
      },
    });
    await channel.prefetch(1);
    await channel.consume(queue, (message) => {
      if (message) void this.processarMensagem(channel, message);
    });
    this.logger.log(`Consumindo fila "${queue}".`);
    this.logger.log(`DLQ configurada: "${dlq}".`);
  }
  private async processarMensagem(channel: Channel, message: ConsumeMessage): Promise<void> {
    let evento: RecuperarSenhaEvent;
    try {
      evento = JSON.parse(message.content.toString()) as RecuperarSenhaEvent;
    } catch {
      this.logger.error('Mensagem encaminhada para DLQ: JSON inválido.');
      channel.nack(message, false, false);
      return;
    }
    const dados = evento.data;
    if (
      evento.pattern !== 'usuario-recuperar-senha' ||
      !dados?.usuarioId ||
      !dados?.nome ||
      !dados?.email ||
      !dados?.link
    ) {
      this.logger.error('Mensagem encaminhada para DLQ: evento de recuperação de senha inválido.');
      channel.nack(message, false, false);
      return;
    }
    try {
      await this.emailService.enviarRecuperacaoSenha(dados);
      channel.ack(message);
    } catch (error) {
      this.logger.error(
        'Falha ao enviar e-mail de recuperação de senha. Mensagem encaminhada para DLQ.',
        error instanceof Error ? error.stack : String(error),
      );
      channel.nack(message, false, false);
    }
  }
}
