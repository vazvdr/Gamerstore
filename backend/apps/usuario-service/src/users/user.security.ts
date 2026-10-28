
import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class UserSecurity {
  async hashSenha(senha: string): Promise<string> {
    return argon2.hash(senha, { type: argon2.argon2id });
  }

  async verificarSenha(hash: string, senha: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, senha);
    } catch {
      return false;
    }
  }
}
