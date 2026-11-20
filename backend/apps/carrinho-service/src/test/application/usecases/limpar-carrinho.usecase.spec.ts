import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LimparCarrinhoUseCase } from '../../../application/usecases/carrinho/limpar-carrinho.usecase';
import type { CarrinhoRepositoryPort } from '../../../application/ports/saida/carrinho-repository.ports';

describe('LimparCarrinhoUseCase', () => {
  let useCase: LimparCarrinhoUseCase;
  let carrinhoRepository: CarrinhoRepositoryPort;

  beforeEach(() => {
    carrinhoRepository = {
      buscarPorUsuarioId: vi.fn(),
      salvar: vi.fn(),
      limpar: vi.fn(),
    } as unknown as CarrinhoRepositoryPort;

    useCase = new LimparCarrinhoUseCase(carrinhoRepository);
  });

  it('deve chamar o repositório para limpar o carrinho do usuário', async () => {
    vi.mocked(carrinhoRepository.limpar).mockResolvedValue(undefined);

    await useCase.execute('usuario-1');

    expect(carrinhoRepository.limpar).toHaveBeenCalledOnce();
    expect(carrinhoRepository.limpar).toHaveBeenCalledWith('usuario-1');
  });

  it('deve concluir sem retornar valor quando a limpeza for realizada', async () => {
    vi.mocked(carrinhoRepository.limpar).mockResolvedValue(undefined);

    const resultado = await useCase.execute('usuario-1');

    expect(resultado).toBeUndefined();
  });

  it('deve propagar erros lançados pelo repositório', async () => {
    const erro = new Error('Falha ao limpar carrinho');

    vi.mocked(carrinhoRepository.limpar).mockRejectedValue(erro);

    await expect(useCase.execute('usuario-1')).rejects.toBe(erro);
  });
});
