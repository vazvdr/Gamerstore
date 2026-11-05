import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfiguracaoRecuperacaoSenhaPorta } from '../../../application/ports/saida/configuracao-recuperacao-senha.ports';

@Injectable()
export class ConfiguracaoRecuperacaoSenhaAdapter implements ConfiguracaoRecuperacaoSenhaPorta {
  constructor(private readonly config: ConfigService) {}

  obterTtl(): number {
    return Number(this.config.get('PASSWORD_RESET_TTL', 300));
  }

  obterUrlFrontend(): string {
    return this.config.getOrThrow<string>('FRONTEND_URL');
  }
}