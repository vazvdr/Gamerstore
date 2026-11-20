
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnderecosGatewayAdapter } from '../../../../adapters/saida/services/enderecos-gateway.adapter';
import { HttpClientService } from '../../../../adapters/saida/http/clients/http-client.service';
import { CadastrarEnderecoDto } from '../../../../adapters/entrada/http/dto/endereco/cadastrar-endereco.dto';
import { EditarEnderecoDto } from '../../../../adapters/entrada/http/dto/endereco/editar-endereco.dto';
import { DeletarEnderecoDto } from '../../../../adapters/entrada/http/dto/endereco/deletar-endereco.dto';

describe('EnderecosGatewayAdapter', () => {
    let adapter: EnderecosGatewayAdapter;
    let httpClient: HttpClientService;
    let config: ConfigService;

    const serviceUrl = 'http://localhost:3002';
    const userId = 'user-123';

    beforeEach(() => {
        httpClient = {
            request: vi.fn().mockResolvedValue({ sucesso: true }),
        } as unknown as HttpClientService;

        config = {
            getOrThrow: vi.fn().mockReturnValue(serviceUrl),
        } as unknown as ConfigService;

        adapter = new EnderecosGatewayAdapter(httpClient, config);
    });

    it('deve configurar a URL do serviço de usuários', () => {
        expect(config.getOrThrow).toHaveBeenCalledWith('USUARIO_SERVICE_URL');
    });

    it('deve cadastrar um endereço', async () => {
        const body: CadastrarEnderecoDto = {
            cep: '12345678',
            rua: 'Rua das Flores',
            numero: '100',
            complemento: 'Apto 101',
            bairro: 'Centro',
            cidade: 'Rio de Janeiro',
            estado: 'RJ',
        };

        await adapter.cadastrarEndereco(body, userId);

        expect(httpClient.request).toHaveBeenCalledWith(
            {
                method: 'POST',
                url: `${serviceUrl}/usuarios/enderecos`,
                data: body,
                headers: { 'x-authenticated-user-id': userId },
            },
            'Não foi possível cadastrar o endereço.',
        );
    });

    it('deve listar os endereços do usuário', async () => {
        await adapter.listarEnderecos(userId);

        expect(httpClient.request).toHaveBeenCalledWith(
            {
                method: 'GET',
                url: `${serviceUrl}/usuarios/enderecos`,
                headers: { 'x-authenticated-user-id': userId },
            },
            'Não foi possível listar os endereços.',
        );
    });

    it('deve editar um endereço', async () => {
        const body = {
            logradouro: 'Rua Nova',
            numero: '200',
            complemento: 'Casa',
            bairro: 'Copacabana',
            cidade: 'Rio de Janeiro',
            estado: 'RJ',
        } as EditarEnderecoDto;

        await adapter.editarEndereco('endereco 1', body, userId);

        expect(httpClient.request).toHaveBeenCalledWith(
            {
                method: 'PATCH',
                url: `${serviceUrl}/usuarios/enderecos/endereco%201`,
                data: body,
                headers: { 'x-authenticated-user-id': userId },
            },
            'Não foi possível atualizar o endereço.',
        );
    });

    it('deve excluir um endereço', async () => {
        const body = { id: 'endereco-123' } as DeletarEnderecoDto;

        await adapter.deletarEndereco(body, userId);

        expect(httpClient.request).toHaveBeenCalledWith(
            {
                method: 'DELETE',
                url: `${serviceUrl}/usuarios/enderecos`,
                data: body,
                headers: { 'x-authenticated-user-id': userId },
            },
            'Não foi possível excluir o endereço.',
        );
    });

    it('deve retornar a resposta do HttpClientService', async () => {
        const response = [{ id: 'endereco-123', logradouro: 'Rua das Flores' }];
        vi.mocked(httpClient.request).mockResolvedValue(response);

        await expect(adapter.listarEnderecos(userId)).resolves.toEqual(response);
    });

    it('deve propagar erros do HttpClientService', async () => {
        const error = new Error('Falha na comunicação');
        vi.mocked(httpClient.request).mockRejectedValue(error);

        await expect(adapter.listarEnderecos(userId)).rejects.toBe(error);
    });
});
