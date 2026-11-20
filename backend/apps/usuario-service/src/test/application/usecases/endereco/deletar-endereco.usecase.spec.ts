
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DeletarEnderecoUseCase } from '../../../../application/usecases/enderecos/deletar-endereco.usecase';
import type { EnderecoRepositorioPorta } from '../../../../application/ports/saida/endereco-repository.ports';
import type { DeletarEnderecoInput } from '../../../../adapters/entrada/http/dto/endereco/deletar-endereco.dto';

describe('DeletarEnderecoUseCase', () => {
  let useCase: DeletarEnderecoUseCase;
  let enderecos: EnderecoRepositorioPorta;

  const dto: DeletarEnderecoInput = {
    id: 'endereco-1',
    user_id: 'usuario-1',
  };

  beforeEach(() => {
    enderecos = {
      criar: vi.fn(),
      buscarPorId: vi.fn(),
      listarPorUsuario: vi.fn(),
      atualizar: vi.fn(),
      definirPrincipal: vi.fn(),
      deletar: vi.fn().mockResolvedValue({ count: 1 }),
    };

    useCase = new DeletarEnderecoUseCase(enderecos);
  });

  it('deve excluir o endereço com sucesso', async () => {
    const resultado = await useCase.execute(dto);

    expect(enderecos.deletar).toHaveBeenCalledWith(dto.id, dto.user_id);
    expect(enderecos.deletar).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual({
      message: 'Endereço excluído com sucesso.',
    });
  });

  it('deve lançar NotFoundException quando nenhum endereço for excluído', async () => {
    vi.mocked(enderecos.deletar).mockResolvedValue({ count: 0 });

    await expect(useCase.execute(dto)).rejects.toThrow(
      new NotFoundException('Endereço não encontrado.'),
    );

    expect(enderecos.deletar).toHaveBeenCalledWith(dto.id, dto.user_id);
  });

  it('deve propagar erro ao excluir o endereço', async () => {
    const erro = new Error('Erro ao excluir endereço');
    vi.mocked(enderecos.deletar).mockRejectedValue(erro);

    await expect(useCase.execute(dto)).rejects.toThrow(erro);

    expect(enderecos.deletar).toHaveBeenCalledWith(dto.id, dto.user_id);
  });
});
