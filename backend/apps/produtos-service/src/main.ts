import { NestFactory } from '@nestjs/core';
import { ProdutosServiceModule } from './produtos-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ProdutosServiceModule);
  const port = Number(process.env.PORT ?? process.env.port ?? 3002);
  await app.listen(port, '127.0.0.1');
}
void bootstrap();