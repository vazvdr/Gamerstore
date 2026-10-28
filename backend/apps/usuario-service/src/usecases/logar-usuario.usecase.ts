import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LogarUsuarioDto } from '../dto/logar-usuario.dto';
import { UserMapper } from '../users/user.mapper';
import { UserRepository } from '../users/user.repository';
import { UserSecurity } from '../users/user.security';

@Injectable()
export class LogarUsuarioUseCase {
  private tentativasLogin = new Map<string, number>();
  private bloqueiosLogin = new Map<string, number>();

  private readonly maxTentativas = 3;
  private readonly tempoBloqueio = 5 * 60 * 1000;

  constructor(
    private readonly users: UserRepository,
    private readonly security: UserSecurity,
  ) { }

  async execute(dto: LogarUsuarioDto, ip: string) {
    const agora = Date.now();
    const bloqueadoAte = this.bloqueiosLogin.get(ip);

    if (bloqueadoAte && agora < bloqueadoAte) {
      const minutosRestantes = Math.ceil((bloqueadoAte - agora) / 60000);
      throw new UnauthorizedException(
        `Muitas tentativas. Tente novamente em ${minutosRestantes} minuto(s).`,
      );
    }

    if (bloqueadoAte && agora >= bloqueadoAte) {
      this.bloqueiosLogin.delete(ip);
      this.tentativasLogin.delete(ip);
    }

    const tentativas = this.tentativasLogin.get(ip) || 0;
    const email = dto.email.trim().toLowerCase();
    const usuario = await this.users.buscarPorEmail(email);
    const senhaValida = usuario
      ? await this.security.verificarSenha(usuario.senha, dto.senha)
      : false;

    if (!senhaValida) {
      const novasTentativas = tentativas + 1;
      this.tentativasLogin.set(ip, novasTentativas);

      if (novasTentativas >= this.maxTentativas) {
        this.bloqueiosLogin.set(ip, Date.now() + this.tempoBloqueio);
        throw new UnauthorizedException(
          'Muitas tentativas. Login bloqueado por 5 minutos.',
        );
      }

      throw new UnauthorizedException(
        'E-mail ou senha inválidos.',
      );
    }

    this.tentativasLogin.delete(ip);
    this.bloqueiosLogin.delete(ip);

    return UserMapper.paraPerfil(usuario!);
  }
}