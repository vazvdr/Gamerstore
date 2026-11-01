import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserRepository } from '../users/user.repository';
import { RecuperarSenhaDto } from '../dto/recuperar-senha.dto';

@Injectable()
export class RecuperarSenhaUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitmq: ClientProxy,
  ) {}

  async execute({ email }: RecuperarSenhaDto) {
    const usuario = await this.userRepository.buscarPorEmail(email);

    if (usuario) {
      try {
        await firstValueFrom(
          this.rabbitmq.emit('usuario-recuperar-senha', {
            usuarioId: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
          }),
        );
      } catch {
        throw new ServiceUnavailableException('Não foi possível processar a solicitação de recuperação de senha.');
      }
    }

    return {
      message: 'Se o e-mail estiver cadastrado, você receberá instruções para recuperar sua senha.',
    };
  }
}