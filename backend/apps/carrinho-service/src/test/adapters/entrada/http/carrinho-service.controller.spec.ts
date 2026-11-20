import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CarrinhoServiceController } from '../../../../adapters/entrada/http/carrinho-service.controller';
import type { CarrinhoService } from '../../../../adapters/entrada/http/carrinho-service.service';

describe('CarrinhoServiceController', () => {
  let controller: CarrinhoServiceController;
  let service: {
    consultar: ReturnType<typeof vi.fn>;
    adicionar: ReturnType<typeof vi.fn>;
    sincronizar: ReturnType<typeof vi.fn>;
    aumentar: ReturnType<typeof vi.fn>;
    diminuir: ReturnType<typeof vi.fn>;
    excluir: ReturnType<typeof vi.fn>;
    limpar: ReturnType<typeof vi.fn>;
  };

  const request = { user: { id: 'usuario-123' } };
  const resultado = { usuarioId: 'usuario-123', itens: [] };

  beforeEach(() => {
    vi.clearAllMocks();

    service = {
      consultar: vi.fn().mockResolvedValue(resultado),
      adicionar: vi.fn().mockResolvedValue(resultado),
      sincronizar: vi.fn().mockResolvedValue(resultado),
      aumentar: vi.fn().mockResolvedValue(resultado),
      diminuir: vi.fn().mockResolvedValue(resultado),
      excluir: vi.fn().mockResolvedValue(resultado),
      limpar: vi.fn().mockResolvedValue(undefined),
    };

    controller = new CarrinhoServiceController(
      service as unknown as CarrinhoService,
    );
  });

  it('deve consultar o carrinho do usuário autenticado', async () => {
    await expect(controller.consultar(request as never)).resolves.toBe(resultado);
    expect(service.consultar).toHaveBeenCalledWith('usuario-123');
  });

  it('deve adicionar um produto ao carrinho', async () => {
    const dto = { produtoId: 'produto-123', quantidade: 2 };

    await expect(controller.adicionar(request as never, dto)).resolves.toBe(resultado);
    expect(service.adicionar).toHaveBeenCalledWith('usuario-123', 'produto-123', 2);
  });

  it('deve sincronizar os itens do carrinho', async () => {
    const itens = [{ produtoId: 'produto-123', quantidade: 3 }];
    const dto = { itens };

    await expect(controller.sincronizar(request as never, dto as never)).resolves.toBe(resultado);
    expect(service.sincronizar).toHaveBeenCalledWith('usuario-123', itens);
  });

  it('deve aumentar a quantidade de um produto', async () => {
    await expect(controller.aumentar(request as never, 'produto-123')).resolves.toBe(resultado);
    expect(service.aumentar).toHaveBeenCalledWith('usuario-123', 'produto-123');
  });

  it('deve diminuir a quantidade de um produto', async () => {
    await expect(controller.diminuir(request as never, 'produto-123')).resolves.toBe(resultado);
    expect(service.diminuir).toHaveBeenCalledWith('usuario-123', 'produto-123');
  });

  it('deve excluir um produto do carrinho', async () => {
    await expect(controller.excluir(request as never, 'produto-123')).resolves.toBe(resultado);
    expect(service.excluir).toHaveBeenCalledWith('usuario-123', 'produto-123');
  });

  it('deve limpar o carrinho do usuário', async () => {
    await expect(controller.limpar(request as never)).resolves.toBeUndefined();
    expect(service.limpar).toHaveBeenCalledWith('usuario-123');
  });
});
