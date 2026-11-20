import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListarEnderecosUseCase } from '../../../../application/usecases/enderecos/listar-enderecos.usecase';
import type { EnderecoRepositorioPorta } from '../../../../application/ports/saida/endereco-repository.ports';
import type { Endereco } from '../../../../domain/entities/endereco';
import type { ListarEnderecosInput } from '../../../../adapters/entrada/http/dto/endereco/listar-enderecos.dto';

describe('ListarEnderecosUseCase', () => {
  let useCase: ListarEnderecosUseCase;
  let enderecos: EnderecoRepositorioPorta;

  const dto: ListarEnderecosInput = {
    user_id: 'usuario-1',
  };

  const listaEnderecos: Endereco[] = [
    {
      id: 'endereco-1',
      bairro: 'Centro',
      cep: '20000-000',
      cidade: 'Rio de Janeiro',
      complemento: 'Apartamento 101',
      estado: 'RJ',
      numero: '123',
      rua: 'Rua das Flores',
      user_id: 'usuario-1',
      principal: true,
    },
    {
      id: 'endereco-2',
      bairro: 'Copacabana',
      cep: '22000-000',
      cidade: 'Rio de Janeiro',
      complemento: null,
      estado: 'RJ',
      numero: '456',
      rua: 'Avenida Atlântica',
      user_id: 'usuario-1',
      principal: false,
    },
  ];

  beforeEach(() => {
    enderecos = {
      criar: vi.fn(),
      buscarPorId: vi.fn(),
      listarPorUsuario: vi.fn().mockResolvedValue(listaEnderecos),
      atualizar: vi.fn(),
      definirPrincipal: vi.fn(),
      deletar: vi.fn(),
    };
    useCase = new ListarEnderecosUseCase(enderecos);
  });

  it('deve listar os endereços do usuário informado', async () => {
    const resultado = await useCase.execute(dto);
    expect(enderecos.listarPorUsuario).toHaveBeenCalledWith(dto.user_id);
    expect(enderecos.listarPorUsuario).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual(listaEnderecos);
  });

  it('deve retornar uma lista vazia quando o usuário não possuir endereços', async () => {
    vi.mocked(enderecos.listarPorUsuario).mockResolvedValue([]);
    const resultado = await useCase.execute(dto);
    expect(enderecos.listarPorUsuario).toHaveBeenCalledWith(dto.user_id);
    expect(resultado).toEqual([]);
  });

  it('deve propagar erro ao consultar os endereços', async () => {
    const erro = new Error('Erro ao listar endereços');
    vi.mocked(enderecos.listarPorUsuario).mockRejectedValue(erro);
    await expect(useCase.execute(dto)).rejects.toThrow(erro);
    expect(enderecos.listarPorUsuario).toHaveBeenCalledWith(dto.user_id);
  });
});
