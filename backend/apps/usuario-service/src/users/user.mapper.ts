
import type { Usuario } from '../../../../node_modules/.prisma/usuario-client';

export class UserMapper {
  static paraPerfil(usuario: Usuario) {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    };
  }
}
