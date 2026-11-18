import { BadGatewayException, HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { isAxiosError, type AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HttpClientService {
  constructor(private readonly http: HttpService) {}

  async request<T>(
    config: AxiosRequestConfig,
    unavailableMessage: string,
  ): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.http.request<T>(config),
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response) {
          throw new HttpException(
            error.response.data,
            error.response.status,
          );
        }
        throw new BadGatewayException(unavailableMessage);
      }
      throw error;
    }
  }
}
