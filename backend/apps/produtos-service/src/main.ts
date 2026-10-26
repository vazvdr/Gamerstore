import { NestFactory } from '@nestjs/core';
import { ProdutosServiceModule } from './produtos-service.module.js';

async function bootstrap() {
  const app = await NestFactory.create(ProdutosServiceModule);
  await app.listen(process.env.port ?? 3002);
}
await bootstrap();
