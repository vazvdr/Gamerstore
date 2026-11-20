
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CadastrarEnderecoUseCase } from '../../../../application/usecases/enderecos/cadastrar-endereco.usecase';
import type { EnderecoRepositorioPorta } from '../../../../application/ports/saida/endereco-repository.ports';
import type { Endereco } from '../../../../domain/entities/endereco';
import type { CadastrarEnderecoInput } from '../../../../adapters/entrada/http/dto/endereco/cadastrar-endereco.dto';

describe('CadastrarEnderecoUseCase', () => {
  let useCase: CadastrarEnderecoUseCase;
  let enderecos: EnderecoRepositorioPorta;

  const dto: CadastrarEnderecoInput = {
    bairro: '  Centro  ',
    cep: '20000-000',
    cidade: '  Rio de Janeiro  ',
    complemento: '  Apartamento 101  ',
    estado: 'rj',
    numero: '  123  ',
    rua: '  Rua das Flores  ',
    user_id: 'usuario-1',
    principal: true,
  };

  const endereco: Endereco = {
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
  };

  beforeEach(() => {
    enderecos = {
      criar: vi.fn().mockResolvedValue(endereco),
      buscarPorId: vi.fn(),
      listarPorUsuario: vi.fn(),
      atualizar: vi.fn(),
      definirPrincipal: vi.fn(),
      deletar: vi.fn(),
    };

    useCase = new CadastrarEnderecoUseCase(enderecos);
  });

  it('deve cadastrar o endereço com os dados normalizados', async () => {
    const resultado = await useCase.execute(dto);

    expect(enderecos.criar).toHaveBeenCalledWith({
      bairro: 'Centro',
      cep: '20000-000',
      cidade: 'Rio de Janeiro',
      complemento: 'Apartamento 101',
      estado: 'RJ',
      numero: '123',
      rua: 'Rua das Flores',
      user_id: 'usuario-1',
      principal: true,
    });

    expect(resultado).toEqual(endereco);
  });

  it('deve definir principal como false quando não informado', async () => {
    const { principal, ...dados } = dto;

    await useCase.execute(dados);

    expect(enderecos.criar).toHaveBeenCalledWith({
      bairro: 'Centro',
      cep: '20000-000',
      cidade: 'Rio de Janeiro',
      complemento: 'Apartamento 101',
      estado: 'RJ',
      numero: '123',
      rua: 'Rua das Flores',
      user_id: 'usuario-1',
      principal: false,
    });
  });

  it('deve preservar principal como false quando explicitamente informado', async () => {
    await useCase.execute({ ...dto, principal: false });

    expect(enderecos.criar).toHaveBeenCalledWith(
      expect.objectContaining({ principal: false }),
    );
  });

  it('deve manter complemento como undefined quando não informado', async () => {
    const { complemento, ...dados } = dto;

    await useCase.execute(dados);

    expect(enderecos.criar).toHaveBeenCalledWith(
      expect.objectContaining({ complemento: undefined }),
    );
  });

  it('deve remover espaços do complemento quando informado', async () => {
    await useCase.execute({ ...dto, complemento: '   Casa fundos   ' });

    expect(enderecos.criar).toHaveBeenCalledWith(
      expect.objectContaining({ complemento: 'Casa fundos' }),
    );
  });

  it('deve converter a UF para letras maiúsculas', async () => {
    await useCase.execute({ ...dto, estado: 'rJ' });

    expect(enderecos.criar).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'RJ' }),
    );
  });

  it('deve propagar erro ao cadastrar o endereço', async () => {
    const erro = new Error('Erro ao cadastrar endereço');
    vi.mocked(enderecos.criar).mockRejectedValue(erro);

    await expect(useCase.execute(dto)).rejects.toThrow(erro);
  });
});
