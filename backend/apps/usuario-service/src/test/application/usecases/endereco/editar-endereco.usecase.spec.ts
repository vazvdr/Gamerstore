
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EditarEnderecoUseCase } from '../../../../application/usecases/enderecos/editar-endereco.usecase';
import type { EnderecoRepositorioPorta } from '../../../../application/ports/saida/endereco-repository.ports';
import type { Endereco } from '../../../../domain/entities/endereco';
import type { EditarEnderecoInput } from '../../../../adapters/entrada/http/dto/endereco/editar-endereco.dto';

describe('EditarEnderecoUseCase', () => {
  let useCase: EditarEnderecoUseCase;
  let enderecos: EnderecoRepositorioPorta;

  const dto: EditarEnderecoInput = {
    id: 'endereco-1',
    user_id: 'usuario-1',
    bairro: '  Copacabana  ',
    cep: '22000-000',
    cidade: '  Rio de Janeiro  ',
    complemento: '  Apartamento 202  ',
    estado: 'rj',
    numero: '  456  ',
    rua: '  Avenida Atlântica  ',
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
    principal: false,
  };

  beforeEach(() => {
    enderecos = {
      criar: vi.fn(),
      buscarPorId: vi.fn().mockResolvedValue(endereco),
      listarPorUsuario: vi.fn(),
      atualizar: vi.fn().mockResolvedValue({ count: 1 }),
      definirPrincipal: vi.fn().mockResolvedValue({ ...endereco, principal: true }),
      deletar: vi.fn(),
    };

    useCase = new EditarEnderecoUseCase(enderecos);
  });

  it('deve atualizar os campos informados com os valores normalizados', async () => {
    const resultado = await useCase.execute(dto);

    expect(enderecos.buscarPorId).toHaveBeenNthCalledWith(1, dto.id, dto.user_id);
    expect(enderecos.atualizar).toHaveBeenCalledWith(dto.id, dto.user_id, {
      bairro: 'Copacabana',
      cep: '22000-000',
      cidade: 'Rio de Janeiro',
      complemento: 'Apartamento 202',
      estado: 'RJ',
      numero: '456',
      rua: 'Avenida Atlântica',
    });
    expect(resultado).toEqual(endereco);
  });

  it('deve lançar NotFoundException quando o endereço não existir', async () => {
    vi.mocked(enderecos.buscarPorId).mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(
      new NotFoundException('Endereço não encontrado.'),
    );

    expect(enderecos.atualizar).not.toHaveBeenCalled();
    expect(enderecos.definirPrincipal).not.toHaveBeenCalled();
  });

  it('deve lançar BadRequestException quando nenhum dado for informado', async () => {
    const dados: EditarEnderecoInput = {
      id: 'endereco-1',
      user_id: 'usuario-1',
    };

    await expect(useCase.execute(dados)).rejects.toThrow(
      new BadRequestException('Nenhum dado foi informado para alteração.'),
    );

    expect(enderecos.atualizar).not.toHaveBeenCalled();
    expect(enderecos.definirPrincipal).not.toHaveBeenCalled();
  });

  it('deve atualizar somente os campos informados', async () => {
    await useCase.execute({
      id: 'endereco-1',
      user_id: 'usuario-1',
      bairro: '  Botafogo  ',
      cidade: '  Rio de Janeiro  ',
    });

    expect(enderecos.atualizar).toHaveBeenCalledWith(
      'endereco-1',
      'usuario-1',
      {
        bairro: 'Botafogo',
        cidade: 'Rio de Janeiro',
      },
    );
  });

  it('deve converter complemento vazio para null', async () => {
    await useCase.execute({
      id: 'endereco-1',
      user_id: 'usuario-1',
      complemento: '   ',
    });

    expect(enderecos.atualizar).toHaveBeenCalledWith(
      'endereco-1',
      'usuario-1',
      { complemento: null },
    );
  });

  it('deve converter estado para letras maiúsculas', async () => {
    await useCase.execute({
      id: 'endereco-1',
      user_id: 'usuario-1',
      estado: 'rj',
    });

    expect(enderecos.atualizar).toHaveBeenCalledWith(
      'endereco-1',
      'usuario-1',
      { estado: 'RJ' },
    );
  });

  it('deve definir o endereço como principal quando principal for true', async () => {
    const resultado = await useCase.execute({
      id: 'endereco-1',
      user_id: 'usuario-1',
      principal: true,
    });

    expect(enderecos.definirPrincipal).toHaveBeenCalledWith('endereco-1', 'usuario-1');
    expect(resultado).toEqual({ ...endereco, principal: true });
  });

  it('deve atualizar os campos antes de definir o endereço como principal', async () => {
    await useCase.execute({
      id: 'endereco-1',
      user_id: 'usuario-1',
      bairro: 'Botafogo',
      principal: true,
    });

    expect(enderecos.atualizar).toHaveBeenCalledWith(
      'endereco-1',
      'usuario-1',
      { bairro: 'Botafogo' },
    );
    expect(enderecos.definirPrincipal).toHaveBeenCalledWith('endereco-1', 'usuario-1');
  });

  it('deve remover a condição de principal quando principal for false e o endereço for principal', async () => {
    vi.mocked(enderecos.buscarPorId).mockResolvedValue({
      ...endereco,
      principal: true,
    });

    await useCase.execute({
      id: 'endereco-1',
      user_id: 'usuario-1',
      principal: false,
    });

    expect(enderecos.atualizar).toHaveBeenCalledWith(
      'endereco-1',
      'usuario-1',
      { principal: false },
    );
  });

  it('não deve atualizar principal quando ele já for false', async () => {
    await useCase.execute({
      id: 'endereco-1',
      user_id: 'usuario-1',
      principal: false,
    });

    expect(enderecos.atualizar).not.toHaveBeenCalled();
    expect(enderecos.definirPrincipal).not.toHaveBeenCalled();
    expect(enderecos.buscarPorId).toHaveBeenCalledTimes(2);
  });

  it('deve retornar o endereço consultado novamente após a atualização', async () => {
    const enderecoAtualizado = { ...endereco, bairro: 'Botafogo' };
    vi.mocked(enderecos.buscarPorId)
      .mockResolvedValueOnce(endereco)
      .mockResolvedValueOnce(enderecoAtualizado);

    const resultado = await useCase.execute({
      id: 'endereco-1',
      user_id: 'usuario-1',
      bairro: 'Botafogo',
    });

    expect(enderecos.buscarPorId).toHaveBeenCalledTimes(2);
    expect(resultado).toEqual(enderecoAtualizado);
  });

  it('deve propagar erro ao buscar o endereço', async () => {
    const erro = new Error('Erro ao buscar endereço');
    vi.mocked(enderecos.buscarPorId).mockRejectedValue(erro);

    await expect(useCase.execute(dto)).rejects.toThrow(erro);

    expect(enderecos.atualizar).not.toHaveBeenCalled();
  });

  it('deve propagar erro ao atualizar os dados do endereço', async () => {
    const erro = new Error('Erro ao atualizar endereço');
    vi.mocked(enderecos.atualizar).mockRejectedValue(erro);

    await expect(useCase.execute(dto)).rejects.toThrow(erro);

    expect(enderecos.buscarPorId).toHaveBeenCalledTimes(1);
  });

  it('deve propagar erro ao definir o endereço como principal', async () => {
    const erro = new Error('Erro ao definir endereço principal');
    vi.mocked(enderecos.definirPrincipal).mockRejectedValue(erro);

    await expect(
      useCase.execute({
        id: 'endereco-1',
        user_id: 'usuario-1',
        principal: true,
      }),
    ).rejects.toThrow(erro);
  });

  it('deve propagar erro ao consultar novamente o endereço atualizado', async () => {
    const erro = new Error('Erro ao consultar endereço atualizado');
    vi.mocked(enderecos.buscarPorId)
      .mockResolvedValueOnce(endereco)
      .mockRejectedValueOnce(erro);

    await expect(
      useCase.execute({
        id: 'endereco-1',
        user_id: 'usuario-1',
        bairro: 'Botafogo',
      }),
    ).rejects.toThrow(erro);
  });
});
