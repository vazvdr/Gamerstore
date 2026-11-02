import { Inject, Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { createHash, randomBytes } from 'node:crypto';
import { firstValueFrom } from 'rxjs';
import { RecuperarSenhaDto } from '../dto/recuperar-senha.dto';
import { RedisService } from '../redis/redis.service';
import { UserRepository } from '../users/user.repository';

@Injectable()
export class RecuperarSenhaUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitmq: ClientProxy,
  ) {}
  async execute({ email }: RecuperarSenhaDto) {
    const usuario = await this.userRepository.buscarPorEmail(email);
    if (usuario) {
      const token = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const ttl = Number(this.config.get('PASSWORD_RESET_TTL', 300));
      const registrado = await this.redis.registrarTokenRecuperacao(
        tokenHash,
        String(usuario.id),
        ttl,
      );
      if (!registrado) {
        throw new InternalServerErrorException('Não foi possível gerar o token de recuperação.');
      }
      const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL').replace(/\/+$/, '');
      const link = `${frontendUrl}/redefinir-senha?token=${token}`;
      try {
        await firstValueFrom(
          this.rabbitmq.emit('usuario-recuperar-senha', {
            usuarioId: String(usuario.id),
            nome: usuario.nome,
            email: usuario.email,
            link,
          }),
        );
      } catch {
        throw new ServiceUnavailableException(
          'Não foi possível processar a solicitação de recuperação de senha.',
        );
      }
    }
    return {
      message: 'Se o e-mail estiver cadastrado, você receberá instruções para recuperar sua senha.',
    };
  }
}