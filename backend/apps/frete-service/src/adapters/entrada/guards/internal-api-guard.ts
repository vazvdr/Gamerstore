import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';

@Injectable()
export class InternalApiGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.getOrThrow<string>('security.internalApiKey');
    const request = context.switchToHttp().getRequest<{ headers: Record<string, unknown> }>();
    const received = request.headers['x-internal-key'];

    if (typeof received !== 'string') {
      throw new UnauthorizedException('Acesso interno não autorizado.');
    }
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(received);
    if (expectedBuffer.length !== receivedBuffer.length || !timingSafeEqual(expectedBuffer, receivedBuffer)) {
      throw new UnauthorizedException('Acesso interno não autorizado.');
    }
    return true;
  }
}
