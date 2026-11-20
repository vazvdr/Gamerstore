
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnderecosUseCase } from '../../usecases/enderecos.usecase';
import { EnderecosGatewayPort } from '../../application/ports/saida/enderecos-gateway.ports';
import { CadastrarEnderecoDto } from '../../adapters/entrada/http/dto/endereco/cadastrar-endereco.dto';
import { EditarEnderecoDto } from '../../adapters/entrada/http/dto/endereco/editar-endereco.dto';
import { DeletarEnderecoDto } from '../../adapters/entrada/http/dto/endereco/deletar-endereco.dto';

describe('EnderecosUseCase', () => {
  let useCase: EnderecosUseCase;
  let enderecosGateway: EnderecosGatewayPort;

  const userId = 'user-123';

  beforeEach(() => {
    enderecosGateway = {
      cadastrarEndereco: vi.fn().mockResolvedValue({ id: 'endereco-1' }),
      listarEnderecos: vi.fn().mockResolvedValue([]),
      editarEndereco: vi.fn().mockResolvedValue({ sucesso: true }),
      deletarEndereco: vi.fn().mockResolvedValue({ sucesso: true }),
    };

    useCase = new EnderecosUseCase(enderecosGateway);
  });

  it('deve cadastrar um endereço para o usuário', async () => {
    const body = { rua: 'Rua das Flores' } as CadastrarEnderecoDto;

    await expect(useCase.cadastrarEndereco(body, userId)).resolves.toEqual({
      id: 'endereco-1',
    });

    expect(enderecosGateway.cadastrarEndereco).toHaveBeenCalledWith(body, userId);
  });

  it('deve listar os endereços do usuário', async () => {
    await expect(useCase.listarEnderecos(userId)).resolves.toEqual([]);

    expect(enderecosGateway.listarEnderecos).toHaveBeenCalledWith(userId);
  });

  it('deve editar um endereço do usuário', async () => {
    const id = 'endereco-1';
    const body = { rua: 'Rua Atualizada' } as EditarEnderecoDto;

    await expect(useCase.editarEndereco(id, body, userId)).resolves.toEqual({
      sucesso: true,
    });

    expect(enderecosGateway.editarEndereco).toHaveBeenCalledWith(id, body, userId);
  });

  it('deve excluir um endereço do usuário', async () => {
    const body = { id: 'endereco-1' } as DeletarEnderecoDto;

    await expect(useCase.deletarEndereco(body, userId)).resolves.toEqual({
      sucesso: true,
    });

    expect(enderecosGateway.deletarEndereco).toHaveBeenCalledWith(body, userId);
  });

  it('deve propagar erros lançados pelo gateway', async () => {
    const error = new Error('Falha na operação');
    vi.mocked(enderecosGateway.listarEnderecos).mockRejectedValue(error);

    await expect(useCase.listarEnderecos(userId)).rejects.toBe(error);
  });
});
