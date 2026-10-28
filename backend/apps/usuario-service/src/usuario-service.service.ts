
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsuarioServiceService {
  healthCheck(): string {
    return 'Usuario Service is running';
  }
}
