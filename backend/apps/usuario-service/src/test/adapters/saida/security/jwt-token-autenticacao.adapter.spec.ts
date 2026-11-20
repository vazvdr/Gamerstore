
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenAutenticacaoAdapter } from '../../../../adapters/saida/security/jwt-token-autenticacao.adapter';

vi.mock('node:crypto', async (importOriginal) => {
    const actual = await importOriginal<typeof import('node:crypto')>();

    return {
        ...actual,
        randomUUID: vi.fn(),
    };
});

describe('JwtTokenAutenticacaoAdapter', () => {
    let adapter: JwtTokenAutenticacaoAdapter;
    let jwt: { signAsync: ReturnType<typeof vi.fn>; verifyAsync: ReturnType<typeof vi.fn> };
    let config: { getOrThrow: ReturnType<typeof vi.fn> };

    const dados = {
        sub: 'usuario-123',
        email: 'joazinho@example.com',
    };

    beforeEach(() => {
        vi.clearAllMocks();

        jwt = {
            signAsync: vi.fn(),
            verifyAsync: vi.fn(),
        };

        config = {
            getOrThrow: vi.fn((chave: string) => {
                if (chave === 'security.jwtAccessSecret') return 'access-secret';
                if (chave === 'security.jwtRefreshSecret') return 'refresh-secret';
                throw new Error(`Configuração não encontrada: ${chave}`);
            }),
        };

        adapter = new JwtTokenAutenticacaoAdapter(
            jwt as unknown as JwtService,
            config as unknown as ConfigService,
        );
    });

    describe('gerarAccessToken', () => {
        it('deve gerar access token com as configurações corretas', async () => {
            jwt.signAsync.mockResolvedValue('access-token');

            const resultado = await adapter.gerarAccessToken(dados);

            expect(resultado).toBe('access-token');
            expect(config.getOrThrow).toHaveBeenCalledWith(
                'security.jwtAccessSecret',
            );
            expect(jwt.signAsync).toHaveBeenCalledWith(dados, {
                secret: 'access-secret',
                expiresIn: '15m',
                algorithm: 'HS256',
            });
        });

        it('deve propagar erros ocorridos durante a assinatura', async () => {
            jwt.signAsync.mockRejectedValue(new Error('Erro ao assinar token'));

            await expect(adapter.gerarAccessToken(dados)).rejects.toThrow(
                'Erro ao assinar token',
            );
        });

        it('deve propagar erros de configuração', async () => {
            config.getOrThrow.mockImplementation(() => {
                throw new Error('Configuração não encontrada');
            });

            await expect(adapter.gerarAccessToken(dados)).rejects.toThrow(
                'Configuração não encontrada',
            );

            expect(jwt.signAsync).not.toHaveBeenCalled();
        });
    });

    describe('gerarRefreshToken', () => {
        it('deve gerar refresh token com type, jti e configurações corretas', async () => {
            const jti = '123e4567-e89b-12d3-a456-426614174000';

            vi.mocked(randomUUID).mockReturnValue(jti);
            jwt.signAsync.mockResolvedValue('refresh-token');

            const resultado = await adapter.gerarRefreshToken(dados);

            expect(resultado).toBe('refresh-token');
            expect(randomUUID).toHaveBeenCalledOnce();
            expect(config.getOrThrow).toHaveBeenCalledWith(
                'security.jwtRefreshSecret',
            );
            expect(jwt.signAsync).toHaveBeenCalledWith(
                {
                    ...dados,
                    type: 'refresh',
                    jti,
                },
                {
                    secret: 'refresh-secret',
                    expiresIn: '7d',
                    algorithm: 'HS256',
                },
            );
        });

        it('deve propagar erros ocorridos durante a assinatura', async () => {
            vi.mocked(randomUUID).mockReturnValue(
                '123e4567-e89b-12d3-a456-426614174000',
            );
            jwt.signAsync.mockRejectedValue(new Error('Erro ao assinar token'));

            await expect(adapter.gerarRefreshToken(dados)).rejects.toThrow(
                'Erro ao assinar token',
            );
        });

        it('deve propagar erros de configuração', async () => {
            config.getOrThrow.mockImplementation(() => {
                throw new Error('Configuração não encontrada');
            });

            await expect(adapter.gerarRefreshToken(dados)).rejects.toThrow(
                'Configuração não encontrada',
            );

            expect(jwt.signAsync).not.toHaveBeenCalled();
        });
    });

    describe('verificarRefreshToken', () => {
        const payload = {
            ...dados,
            type: 'refresh',
            jti: 'uuid-123',
        };

        it('deve retornar o payload quando o refresh token for válido', async () => {
            jwt.verifyAsync.mockResolvedValue(payload);

            const resultado = await adapter.verificarRefreshToken('refresh-token');

            expect(resultado).toEqual(payload);
            expect(jwt.verifyAsync).toHaveBeenCalledWith('refresh-token', {
                secret: 'refresh-secret',
                algorithms: ['HS256'],
            });
        });

        it('deve retornar null quando o tipo do token for inválido', async () => {
            jwt.verifyAsync.mockResolvedValue({
                ...payload,
                type: 'access',
            });

            const resultado = await adapter.verificarRefreshToken('token');

            expect(resultado).toBeNull();
        });

        it('deve retornar null quando o subject estiver ausente', async () => {
            jwt.verifyAsync.mockResolvedValue({
                ...payload,
                sub: '',
            });

            const resultado = await adapter.verificarRefreshToken('token');

            expect(resultado).toBeNull();
        });

        it('deve retornar null quando o email estiver ausente', async () => {
            jwt.verifyAsync.mockResolvedValue({
                ...payload,
                email: '',
            });

            const resultado = await adapter.verificarRefreshToken('token');

            expect(resultado).toBeNull();
        });

        it('deve retornar null quando o jti estiver ausente', async () => {
            jwt.verifyAsync.mockResolvedValue({
                ...payload,
                jti: '',
            });

            const resultado = await adapter.verificarRefreshToken('token');

            expect(resultado).toBeNull();
        });

        it('deve retornar null quando a verificação do token lançar erro', async () => {
            jwt.verifyAsync.mockRejectedValue(new Error('Token expirado'));

            const resultado = await adapter.verificarRefreshToken('token-expirado');

            expect(resultado).toBeNull();
        });

        it('deve propagar erros de configuração', async () => {
            config.getOrThrow.mockImplementation(() => {
                throw new Error('Configuração não encontrada');
            });

            await expect(
                adapter.verificarRefreshToken('refresh-token'),
            ).rejects.toThrow('Configuração não encontrada');

            expect(jwt.verifyAsync).not.toHaveBeenCalled();
        });
    });
});
