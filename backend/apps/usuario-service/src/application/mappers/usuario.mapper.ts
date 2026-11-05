import type { Usuario } from '../../domain/entities/usuario';

export class UsuarioMapper {
  static paraPerfil(usuario: Usuario) {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    };
  }
}