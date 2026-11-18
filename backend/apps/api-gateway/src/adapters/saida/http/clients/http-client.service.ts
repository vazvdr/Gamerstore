import { BadGatewayException, GatewayTimeoutException, HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { isAxiosError, type AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { InternalApiHeadersService } from '../configuration/internal-api-headers.service';

@Injectable()
export class HttpClientService {
  constructor(private readonly http: HttpService, internalApiHeaders: InternalApiHeadersService) {
    this.http.axiosRef.interceptors.request.use((config) => {
      config.headers.set('x-internal-key', internalApiHeaders.getInternalApiKey());
      return config;
    });
  }

  async request<T>(config: AxiosRequestConfig, unavailableMessage: string): Promise<T> {
    try {
      const response = await firstValueFrom(this.http.request<T>(config));
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response) throw new HttpException(error.response.data, error.response.status);
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') throw new GatewayTimeoutException(unavailableMessage);
        throw new BadGatewayException(unavailableMessage);
      }
      throw error;
    }
  }
}
