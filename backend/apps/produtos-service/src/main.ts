import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { ProdutosServiceModule } from './produtos-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ProdutosServiceModule);
  await app.listen(process.env.PORT ?? process.env.port ?? 3002);
}

void bootstrap();