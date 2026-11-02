import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { EmailModule } from './email/email.module';
import { RecuperarSenhaConsumer } from './consumers/recuperar-senha.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/email-service/.env',
    }),
    RabbitMQModule,
    EmailModule,
  ],
  providers: [RecuperarSenhaConsumer],
})
export class EmailServiceModule {}
