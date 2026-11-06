import { Module } from '@nestjs/common';
import { RecuperarSenhaConsumer } from './consumers/recuperar-senha.consumer';
import { RabbitMQService } from './rabbitmq.service';
import { EmailUseCasesModule } from '../../../../modules/email-usecase.module';

@Module({
  imports: [EmailUseCasesModule],
  providers: [RabbitMQService, RecuperarSenhaConsumer],
})
export class RabbitMQModule {}
