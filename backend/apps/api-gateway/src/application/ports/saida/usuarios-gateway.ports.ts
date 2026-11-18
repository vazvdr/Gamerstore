export abstract class UsuariosGatewayPort {
  abstract cadastrarUsuario(body: unknown): Promise<unknown>;
  abstract loginUsuario(body: unknown): Promise<unknown>;
  abstract refreshUsuario(body: unknown): Promise<unknown>;
  abstract editarUsuario(body: unknown, userId: string): Promise<unknown>;
  abstract deletarUsuario(body: unknown, userId: string): Promise<unknown>;
  abstract recuperarSenha(body: { email: string }): Promise<unknown>;
  abstract redefinirSenha(body: { token: string; senha: string}): Promise<unknown>;
}
