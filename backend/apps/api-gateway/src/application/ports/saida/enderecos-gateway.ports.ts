export abstract class EnderecosGatewayPort {
  abstract cadastrarEndereco(body: unknown, userId: string): Promise<unknown>;
  abstract listarEnderecos(userId: string): Promise<unknown>;
  abstract editarEndereco(id: string, body: unknown, userId: string): Promise<unknown>;
  abstract deletarEndereco(body: { id: string }, userId: string): Promise<unknown>;
}
