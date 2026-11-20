
import { BadGatewayException, GatewayTimeoutException, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError, type AxiosRequestConfig } from 'axios';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpClientService } from '../../../../../adapters/saida/http/clients/http-client.service';
import { InternalApiHeadersService } from '../../../../../adapters/saida/http/configuration/internal-api-headers.service';

describe('HttpClientService', () => {
    let service: HttpClientService;
    let http: HttpService;
    let internalApiHeaders: InternalApiHeadersService;

    beforeEach(() => {
        const requestInterceptor = {
            use: vi.fn(),
        };

        http = {
            axiosRef: {
                interceptors: {
                    request: requestInterceptor,
                },
            },
            request: vi.fn(),
        } as unknown as HttpService;

        internalApiHeaders = {
            getInternalApiKey: vi.fn().mockReturnValue('internal-key'),
        } as unknown as InternalApiHeadersService;

        service = new HttpClientService(http, internalApiHeaders);
    });

    it('deve adicionar o header interno no interceptor', () => {
        const interceptor = vi.mocked(http.axiosRef.interceptors.request.use).mock.calls[0]?.[0];

        expect(interceptor).toBeTypeOf('function');

        if (!interceptor) throw new Error('Interceptor não foi registrado');

        const config = { headers: { set: vi.fn() } };
        const result = interceptor(config as never);

        expect(config.headers.set).toHaveBeenCalledWith('x-internal-key', 'internal-key');
        expect(result).toBe(config);
    });
    
    it('deve retornar os dados da resposta', async () => {
        const response = { id: '1', nome: 'Joazinho' };

        vi.mocked(http.request).mockReturnValue(of({
            data: response,
        }) as never);

        await expect(
            service.request({ method: 'GET', url: '/usuarios' }, 'Serviço indisponível'),
        ).resolves.toEqual(response);
    });

    it('deve lançar HttpException quando Axios retornar uma resposta HTTP de erro', async () => {
        const error = new AxiosError('Request failed');

        error.response = {
            data: { message: 'Usuário não encontrado' },
            status: 404,
            statusText: 'Not Found',
            headers: {},
            config: {} as never,
        };

        vi.mocked(http.request).mockReturnValue(throwError(() => error) as never);

        await expect(
            service.request({ method: 'GET', url: '/usuarios/1' }, 'Serviço indisponível'),
        ).rejects.toBeInstanceOf(HttpException);

        await expect(
            service.request({ method: 'GET', url: '/usuarios/1' }, 'Serviço indisponível'),
        ).rejects.toMatchObject({
            response: { message: 'Usuário não encontrado' },
            status: 404,
        });
    });

    it.each(['ECONNABORTED', 'ETIMEDOUT'])(
        'deve lançar GatewayTimeoutException quando ocorrer timeout (%s)',
        async (code) => {
            const error = new AxiosError('Timeout');
            error.code = code;

            vi.mocked(http.request).mockReturnValue(throwError(() => error) as never);

            await expect(
                service.request({ method: 'GET', url: '/usuarios' }, 'Serviço indisponível'),
            ).rejects.toBeInstanceOf(GatewayTimeoutException);
        },
    );

    it('deve lançar BadGatewayException quando Axios falhar sem resposta e sem timeout', async () => {
        const error = new AxiosError('Network Error');
        error.code = 'ERR_NETWORK';

        vi.mocked(http.request).mockReturnValue(throwError(() => error) as never);

        await expect(
            service.request({ method: 'GET', url: '/usuarios' }, 'Serviço indisponível'),
        ).rejects.toBeInstanceOf(BadGatewayException);
    });

    it('deve propagar erros que não sejam do Axios', async () => {
        const error = new Error('Erro inesperado');

        vi.mocked(http.request).mockReturnValue(throwError(() => error) as never);

        await expect(
            service.request({ method: 'GET', url: '/usuarios' }, 'Serviço indisponível'),
        ).rejects.toBe(error);
    });
});
