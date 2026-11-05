import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const queue = config.get<string>('RABBITMQ_RECUPERAR_SENHA_QUEUE') ?? 'usuario-recuperar-senha';
          return {
            transport: Transport.RMQ,
            options: {
              urls: [config.getOrThrow<string>('RABBITMQ_URL')],
              queue,
              queueOptions: {
                durable: true,
                arguments: {
                  'x-dead-letter-exchange': `${queue}.dlx`,
                  'x-dead-letter-routing-key': `${queue}.dlq`,
                },
              },
            },
          };
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMQModule { }