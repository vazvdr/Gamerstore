import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NotificacaoRecuperacaoSenhaPorta } from '../../../../application/ports/saida/notificacao-recuperacao-senha.ports';

@Injectable()
export class RabbitMQNotificacaoRecuperacaoSenhaAdapter implements NotificacaoRecuperacaoSenhaPorta {
  constructor(
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitmq: ClientProxy,
  ) {}

  async enviar(dados: {
    usuarioId: string;
    nome: string;
    email: string;
    link: string;
  }): Promise<void> {
    await firstValueFrom(
      this.rabbitmq.emit('usuario-recuperar-senha', dados),
    );
  }
}
