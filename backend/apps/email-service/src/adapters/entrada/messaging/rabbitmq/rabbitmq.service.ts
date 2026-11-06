import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, type Channel, type ChannelModel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection?: ChannelModel;
  private channel?: Channel;

  constructor(private readonly config: ConfigService) {}

  async getChannel(): Promise<Channel> {
    if (this.channel) return this.channel;
    const connection = await connect(
      this.config.get<string>('RABBITMQ_URL', 'amqp://localhost:5672'),
    );
    this.connection = connection;
    const channel = await connection.createChannel();
    this.channel = channel;
    this.logger.log('Conectado ao RabbitMQ.');
    connection.on('error', (error: Error) => {
      this.logger.error(`Erro na conexão RabbitMQ: ${error.message}`);
    });
    connection.on('close', () => {
      this.channel = undefined;
      this.connection = undefined;
      this.logger.warn('Conexão com RabbitMQ encerrada.');
    });
    return channel;
  }
  async onModuleDestroy(): Promise<void> {
    await this.channel?.close().catch(() => undefined);
    await this.connection?.close().catch(() => undefined);
  }
}