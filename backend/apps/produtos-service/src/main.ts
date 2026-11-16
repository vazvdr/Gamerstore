import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ProdutosServiceModule } from './produtos-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ProdutosServiceModule);
  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>('port');
  await app.listen(port, '127.0.0.1');
}
void bootstrap();