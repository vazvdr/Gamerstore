import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { RedefinirSenhaDto } from '../dto/redefinir-senha.dto';
import { RedisService } from '../redis/redis.service';
import { UserRepository } from '../users/user.repository';
import { UserSecurity } from '../users/user.security';

@Injectable()
export class RedefinirSenhaUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly security: UserSecurity,
    private readonly redis: RedisService,
  ) {}

  async execute(dto: RedefinirSenhaDto) {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const usuarioId = await this.redis.buscarTokenRecuperacao(tokenHash);
    if (!usuarioId) {
      throw new UnauthorizedException('Token de recuperação inválido ou expirado.');
    }
    const tokenConsumido = await this.redis.consumirTokenRecuperacao(tokenHash, usuarioId);
    if (!tokenConsumido) {
      throw new UnauthorizedException('Token de recuperação inválido ou expirado.');
    }
    const senhaHash = await this.security.hashSenha(dto.senha);
    await this.users.atualizar(usuarioId, { senha: senhaHash });
    return {
      message: 'Senha redefinida com sucesso.',
    };
  }
}
