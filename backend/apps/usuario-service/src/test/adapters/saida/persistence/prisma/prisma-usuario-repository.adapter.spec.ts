
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaUsuarioRepositoryAdapter } from '../../../../../adapters/saida/persistence/prisma/prisma-usuario-repository.adapter';
import type { PrismaService } from '../../../../../adapters/saida/persistence/prisma/prisma.service';
import type { Usuario } from '../../../../../domain/entities/usuario';

describe('PrismaUsuarioRepositoryAdapter', () => {
  let adapter: PrismaUsuarioRepositoryAdapter;
  let prisma: PrismaService;

  const usuario: Usuario = {
    id: 'usuario-1',
    admin: false,
    nome: 'Joazinho',
    email: 'teste@email.com',
    senha: 'senha-hash',
  };

  beforeEach(() => {
    prisma = {
      usuario: {
        findUnique: vi.fn().mockResolvedValue(usuario),
        create: vi.fn().mockResolvedValue(usuario),
        update: vi.fn().mockResolvedValue(usuario),
        delete: vi.fn().mockResolvedValue(usuario),
      },
    } as unknown as PrismaService;

    adapter = new PrismaUsuarioRepositoryAdapter(prisma);
  });

  it('deve buscar usuário por e-mail', async () => {
    const resultado = await adapter.buscarPorEmail(usuario.email);

    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: usuario.email },
    });
    expect(resultado).toEqual(usuario);
  });

  it('deve retornar null quando não encontrar usuário por e-mail', async () => {
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue(null);

    const resultado = await adapter.buscarPorEmail(usuario.email);

    expect(resultado).toBeNull();
  });

  it('deve buscar usuário por ID', async () => {
    const resultado = await adapter.buscarPorId(usuario.id);

    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: usuario.id },
    });
    expect(resultado).toEqual(usuario);
  });

  it('deve retornar null quando não encontrar usuário por ID', async () => {
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue(null);

    const resultado = await adapter.buscarPorId(usuario.id);

    expect(resultado).toBeNull();
  });

  it('deve criar usuário definindo admin como false', async () => {
    const dados = {
      nome: 'Joazinho',
      email: 'novo@email.com',
      senha: 'senha-hash',
    };

    const resultado = await adapter.criar(dados);

    expect(prisma.usuario.create).toHaveBeenCalledWith({
      data: {
        ...dados,
        admin: false,
      },
    });
    expect(resultado).toEqual(usuario);
  });

  it('deve atualizar usuário pelo ID', async () => {
    const dados = {
      nome: 'Novo nome',
      email: 'novo@email.com',
    };

    const resultado = await adapter.atualizar(usuario.id, dados);

    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: usuario.id },
      data: dados,
    });
    expect(resultado).toEqual(usuario);
  });

  it('deve excluir usuário pelo ID', async () => {
    const resultado = await adapter.deletarPorId(usuario.id);

    expect(prisma.usuario.delete).toHaveBeenCalledWith({
      where: { id: usuario.id },
    });
    expect(resultado).toEqual(usuario);
  });

  it('deve propagar erro ao buscar usuário por e-mail', async () => {
    const erro = new Error('Erro ao buscar usuário');
    vi.mocked(prisma.usuario.findUnique).mockRejectedValue(erro);

    await expect(adapter.buscarPorEmail(usuario.email)).rejects.toThrow(erro);
  });

  it('deve propagar erro ao buscar usuário por ID', async () => {
    const erro = new Error('Erro ao buscar usuário');
    vi.mocked(prisma.usuario.findUnique).mockRejectedValue(erro);

    await expect(adapter.buscarPorId(usuario.id)).rejects.toThrow(erro);
  });

  it('deve propagar erro ao criar usuário', async () => {
    const erro = new Error('Erro ao criar usuário');
    vi.mocked(prisma.usuario.create).mockRejectedValue(erro);

    await expect(
      adapter.criar({
        nome: 'Joazinho',
        email: 'novo@email.com',
        senha: 'senha-hash',
      }),
    ).rejects.toThrow(erro);
  });

  it('deve propagar erro ao atualizar usuário', async () => {
    const erro = new Error('Erro ao atualizar usuário');
    vi.mocked(prisma.usuario.update).mockRejectedValue(erro);

    await expect(
      adapter.atualizar(usuario.id, { nome: 'Novo nome' }),
    ).rejects.toThrow(erro);
  });

  it('deve propagar erro ao excluir usuário', async () => {
    const erro = new Error('Erro ao excluir usuário');
    vi.mocked(prisma.usuario.delete).mockRejectedValue(erro);

    await expect(adapter.deletarPorId(usuario.id)).rejects.toThrow(erro);
  });
});
