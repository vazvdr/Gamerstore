
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CarrinhoService } from '../../../../adapters/entrada/http/carrinho-service.service';
import type { AdicionarProdutoUseCase } from '../../../../application/usecases/carrinho/adicionar-produto.usecase';
import type { AumentarQuantidadeProdutoUseCase } from '../../../../application/usecases/carrinho/aumentar-quantidade-produto.usecase';
import type { ConsultarCarrinhoUseCase } from '../../../../application/usecases/carrinho/consultar-carrinho.usecase';
import type { DiminuirQuantidadeProdutoUseCase } from '../../../../application/usecases/carrinho/diminuir-quantidade-produto.usecase';
import type { ExcluirProdutoUseCase } from '../../../../application/usecases/carrinho/excluir-produto.usecase';
import type { LimparCarrinhoUseCase } from '../../../../application/usecases/carrinho/limpar-carrinho.usecase';
import type { SincronizarCarrinhoUseCase, ItemParaSincronizacao } from '../../../../application/usecases/carrinho/sincronizar-carrinho.usecase';

describe('CarrinhoService', () => {
  let service: CarrinhoService;
  let adicionar: { execute: ReturnType<typeof vi.fn> };
  let aumentar: { execute: ReturnType<typeof vi.fn> };
  let consultar: { execute: ReturnType<typeof vi.fn> };
  let diminuir: { execute: ReturnType<typeof vi.fn> };
  let excluir: { execute: ReturnType<typeof vi.fn> };
  let limpar: { execute: ReturnType<typeof vi.fn> };
  let sincronizar: { execute: ReturnType<typeof vi.fn> };

  const resultado = { usuarioId: 'usuario-123', itens: [] };

  beforeEach(() => {
    vi.clearAllMocks();

    adicionar = { execute: vi.fn().mockResolvedValue(resultado) };
    aumentar = { execute: vi.fn().mockResolvedValue(resultado) };
    consultar = { execute: vi.fn().mockResolvedValue(resultado) };
    diminuir = { execute: vi.fn().mockResolvedValue(resultado) };
    excluir = { execute: vi.fn().mockResolvedValue(resultado) };
    limpar = { execute: vi.fn().mockResolvedValue(undefined) };
    sincronizar = { execute: vi.fn().mockResolvedValue(resultado) };

    service = new CarrinhoService(
      adicionar as unknown as AdicionarProdutoUseCase,
      aumentar as unknown as AumentarQuantidadeProdutoUseCase,
      consultar as unknown as ConsultarCarrinhoUseCase,
      diminuir as unknown as DiminuirQuantidadeProdutoUseCase,
      excluir as unknown as ExcluirProdutoUseCase,
      limpar as unknown as LimparCarrinhoUseCase,
      sincronizar as unknown as SincronizarCarrinhoUseCase,
    );
  });

  it('deve delegar a consulta ao ConsultarCarrinhoUseCase', async () => {
    await expect(service.consultar('usuario-123')).resolves.toBe(resultado);
    expect(consultar.execute).toHaveBeenCalledWith('usuario-123');
  });

  it('deve delegar a adição ao AdicionarProdutoUseCase', async () => {
    const comando = { usuarioId: 'usuario-123', produtoId: 'produto-123', quantidade: 2 };

    await expect(service.adicionar('usuario-123', 'produto-123', 2)).resolves.toBe(resultado);
    expect(adicionar.execute).toHaveBeenCalledWith(comando);
  });

  it('deve delegar a sincronização ao SincronizarCarrinhoUseCase', async () => {
    const itens = [{ produtoId: 'produto-123', quantidade: 2 }] as ItemParaSincronizacao[];

    await expect(service.sincronizar('usuario-123', itens)).resolves.toBe(resultado);
    expect(sincronizar.execute).toHaveBeenCalledWith('usuario-123', itens);
  });

  it('deve delegar o aumento ao AumentarQuantidadeProdutoUseCase', async () => {
    await expect(service.aumentar('usuario-123', 'produto-123')).resolves.toBe(resultado);
    expect(aumentar.execute).toHaveBeenCalledWith('usuario-123', 'produto-123');
  });

  it('deve delegar a diminuição ao DiminuirQuantidadeProdutoUseCase', async () => {
    await expect(service.diminuir('usuario-123', 'produto-123')).resolves.toBe(resultado);
    expect(diminuir.execute).toHaveBeenCalledWith('usuario-123', 'produto-123');
  });

  it('deve delegar a exclusão ao ExcluirProdutoUseCase', async () => {
    await expect(service.excluir('usuario-123', 'produto-123')).resolves.toBe(resultado);
    expect(excluir.execute).toHaveBeenCalledWith('usuario-123', 'produto-123');
  });

  it('deve delegar a limpeza ao LimparCarrinhoUseCase', async () => {
    await expect(service.limpar('usuario-123')).resolves.toBeUndefined();
    expect(limpar.execute).toHaveBeenCalledWith('usuario-123');
  });

  it('deve propagar erros lançados pelos casos de uso', async () => {
    const erro = new Error('Falha ao consultar carrinho');
    consultar.execute.mockRejectedValue(erro);

    await expect(service.consultar('usuario-123')).rejects.toBe(erro);
  });
});
