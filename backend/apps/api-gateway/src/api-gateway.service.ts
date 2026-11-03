import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ApiGatewayService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) { }

  private getHeaders(extraHeaders: Record<string, string> = {}) {
    const key = this.config.get<string>('INTERNAL_API_KEY');
    if (!key) throw new Error('INTERNAL_API_KEY não está configurada no API Gateway.');
    return {
      headers: { 'x-internal-key': key, ...extraHeaders },
    };
  }
  async listarProdutos() {
    try {
      const response = await firstValueFrom(
        this.http.get(
          `${this.config.getOrThrow<string>('PRODUTOS_SERVICE_URL')}/produtos`,
          this.getHeaders(),
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error?.response?.data ?? { message: 'Não foi possível listar os produtos.' },
        error?.response?.status ?? 502,
      );
    }
  }
  async listarProdutosPorId(id: string) {
    try {
      const response = await firstValueFrom(
        this.http.get(
          `${this.config.getOrThrow<string>('PRODUTOS_SERVICE_URL')}/produtos/${encodeURIComponent(id)}`,
          this.getHeaders(),
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error?.response?.data ?? { message: 'Não foi possível buscar o produto.' },
        error?.response?.status ?? 502,
      );
    }
  }
  async cadastrarUsuario(body: unknown) {
    try {
      const response = await firstValueFrom(
        this.http.post(
          `${this.config.getOrThrow<string>('USUARIO_SERVICE_URL')}/usuarios/cadastro`,
          body,
          this.getHeaders(),
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error?.response?.data ?? { message: 'Não foi possível cadastrar o usuário.' },
        error?.response?.status ?? 502,
      );
    }
  }
  async loginUsuario(body: unknown) {
    try {
      const response = await firstValueFrom(
        this.http.post(
          `${this.config.getOrThrow<string>('USUARIO_SERVICE_URL')}/usuarios/login`,
          body,
          this.getHeaders(),
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error?.response?.data ?? { message: 'Não foi possível autenticar o usuário.' },
        error?.response?.status ?? 502,
      );
    }
  }
  async refreshUsuario(body: unknown) {
    try {
      const response = await firstValueFrom(
        this.http.post(
          `${this.config.getOrThrow<string>('USUARIO_SERVICE_URL')}/usuarios/refresh`,
          body,
          this.getHeaders(),
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error?.response?.data ?? { message: 'Não foi possível renovar a sessão.' },
        error?.response?.status ?? 502,
      );
    }
  }
  async editarUsuario(body: unknown, userId: string) {
    try {
      const response = await firstValueFrom(
        this.http.patch(
          `${this.config.getOrThrow<string>('USUARIO_SERVICE_URL')}/usuarios/editar`,
          body,
          this.getHeaders({ 'x-authenticated-user-id': userId }),
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error?.response?.data ?? { message: 'Não foi possível atualizar os dados do usuário.' },
        error?.response?.status ?? 502,
      );
    }
  }
  async deletarUsuario(body: unknown, userId: string) {
    try {
      const response = await firstValueFrom(
        this.http.delete(
          `${this.config.getOrThrow<string>('USUARIO_SERVICE_URL')}/usuarios`,
          {
            ...this.getHeaders({ 'x-authenticated-user-id': userId }),
            data: body,
          },
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error?.response?.data ?? { message: 'Não foi possível excluir a conta do usuário.' },
        error?.response?.status ?? 502,
      );
    }
  }
  async recuperarSenha(body: { email: string }) {
    try {
      const response = await firstValueFrom(
        this.http.post(
          `${this.config.getOrThrow<string>('USUARIO_SERVICE_URL')}/usuarios/recuperar-senha`,
          body,
          this.getHeaders(),
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error?.response?.data ?? { message: 'Não foi possível processar a solicitação de recuperação de senha.' },
        error?.response?.status ?? 502,
      );
    }
  }
  async redefinirSenha(body: { token: string; senha: string }) {
    try {
      const response = await firstValueFrom(
        this.http.post(
          `${this.config.getOrThrow<string>('USUARIO_SERVICE_URL')}/usuarios/redefinir-senha`,
          body,
          this.getHeaders(),
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error?.response?.data ?? { message: 'Não foi possível redefinir a senha.' },
        error?.response?.status ?? 502,
      );
    }
  }
  async cadastrarEndereco(body: unknown, userId: string) {
    try {
      const response = await firstValueFrom(
        this.http.post(
          `${this.config.getOrThrow<string>('USUARIO_SERVICE_URL')}/usuarios/enderecos`,
          body,
          this.getHeaders({ 'x-authenticated-user-id': userId }),
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error?.response?.data ?? { message: 'Não foi possível cadastrar o endereço.' },
        error?.response?.status ?? 502,
      );
    }
  }
  async listarEnderecos(userId: string) {
    try {
      const response = await firstValueFrom(
        this.http.get(
          `${this.config.getOrThrow<string>('USUARIO_SERVICE_URL')}/usuarios/enderecos`,
          this.getHeaders({ 'x-authenticated-user-id': userId }),
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error?.response?.data ?? { message: 'Não foi possível listar os endereços.' },
        error?.response?.status ?? 502,
      );
    }
  }
  async editarEndereco(id: string, body: unknown, userId: string) {
    try {
      const response = await firstValueFrom(
        this.http.patch(
          `${this.config.getOrThrow<string>('USUARIO_SERVICE_URL')}/usuarios/enderecos/${encodeURIComponent(id)}`,
          body,
          this.getHeaders({ 'x-authenticated-user-id': userId }),
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error?.response?.data ?? { message: 'Não foi possível atualizar o endereço.' },
        error?.response?.status ?? 502,
      );
    }
  }
  async deletarEndereco(body: { id: string }, userId: string) {
    try {
      const response = await firstValueFrom(
        this.http.delete(
          `${this.config.getOrThrow<string>('USUARIO_SERVICE_URL')}/usuarios/enderecos`,
          {
            ...this.getHeaders({ 'x-authenticated-user-id': userId }),
            data: body,
          },
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error?.response?.data ?? { message: 'Não foi possível excluir o endereço.' },
        error?.response?.status ?? 502,
      );
    }
  }
}