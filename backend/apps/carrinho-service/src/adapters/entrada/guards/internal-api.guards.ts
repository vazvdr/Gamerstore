import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

@Injectable()
export class InternalApiGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();
    const internalKey = request.headers['x-internal-key'];
    const userId = request.headers['x-user-id'];
    const expectedKey = this.config.getOrThrow<string>(
      'security.internalApiKey',
    );
    if (internalKey !== expectedKey) {
      throw new UnauthorizedException('Chave interna inválida.');
    }
    if (typeof userId !== 'string' || !userId.trim()) {
      throw new UnauthorizedException('Usuário não identificado.');
    }
    request.user = { id: userId };
    return true;
  }
}
