import { NestFactory } from '@nestjs/core';
import { existsSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

import { ProdutosServiceModule } from './produtos-service.module';
const envCandidates = [
  path.resolve(process.cwd(), 'apps/produtos-service/.env'),
  path.resolve(process.cwd(), 'backend/apps/produtos-service/.env'),
];
const envPath = envCandidates.find(existsSync);
if (!envPath) {
  throw new Error(`Arquivo .env do Produtos Service não encontrado. Diretório atual: ${process.cwd()}`);
}
dotenv.config({ path: envPath });
if (!process.env.INTERNAL_API_KEY) {
  throw new Error(`INTERNAL_API_KEY não encontrada em: ${envPath}`);
}
async function bootstrap() {
  const app = await NestFactory.create(ProdutosServiceModule);
  const port = Number(process.env.PORT ?? process.env.port ?? 3002);
  await app.listen(port, '127.0.0.1');
}
void bootstrap();