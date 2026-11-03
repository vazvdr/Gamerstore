
import type { Usuario } from '@prisma/usuario-client/client';

export class UserMapper {
  static paraPerfil(usuario: Usuario) {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    };
  }
}
