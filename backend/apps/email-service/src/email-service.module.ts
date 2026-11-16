import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration, { validateConfiguration } from './config/configuration';
import { RabbitMQModule } from './adapters/entrada/messaging/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/email-service/.env',
      load: [configuration],
      validate: validateConfiguration,
    }),
    RabbitMQModule,
  ],
})
export class EmailServiceModule {}
