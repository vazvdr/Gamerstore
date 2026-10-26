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
    return {
      headers: {
        'x-internal-key': this.config.get<string>('INTERNAL_API_KEY'),
      },
    };
  }

  async listar() {
    try {
      const response = await firstValueFrom(
        this.http.get(
          `${this.config.get<string>('PRODUTOS_SERVICE_URL')}/produtos`,
          this.getHeaders(),
        ),
      );

      return response.data;
    } catch (error: any) {
      const status = error?.response?.status ?? 500;
      const data = error?.response?.data;

      throw new HttpException(
        data ?? { message: error?.message ?? 'Erro ao listar produtos.' },
        status,
      );
    }
  }

  async buscarPorId(id: string) {
    try {
      const response = await firstValueFrom(
        this.http.get(
          `${this.config.get<string>('PRODUTOS_SERVICE_URL')}/produtos/${id}`,
          this.getHeaders(),
        ),
      );

      return response.data;
    } catch (error: any) {
      const status = error?.response?.status ?? 500;
      const data = error?.response?.data;

      throw new HttpException(
        data ?? { message: error?.message ?? 'Erro ao buscar produto.' },
        status,
      );
    }
  }
}