import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ApiGatewayService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}
  private getHeaders() {
    const key = this.config.get<string>('INTERNAL_API_KEY');
    if (!key) throw new Error('INTERNAL_API_KEY não está configurada no API Gateway.');
    return { headers: { 'x-internal-key': key } };
  }

  async listar() {
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
  async buscarPorId(id: string) {
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
}