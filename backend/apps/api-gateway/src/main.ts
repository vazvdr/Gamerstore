
import { NestFactory } from '@nestjs/core';
import { existsSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

import { ApiGatewayModule } from './api-gateway.module';

const envCandidates = [
  path.resolve(process.cwd(), 'apps/api-gateway/.env'),
  path.resolve(process.cwd(), 'backend/apps/api-gateway/.env'),
];
const envPath = envCandidates.find(existsSync);
if (!envPath) {
  throw new Error(`Arquivo .env da API Gateway não encontrado. Diretório atual: ${process.cwd()}`);
}
dotenv.config({ path: envPath });
if (!process.env.PRODUTOS_SERVICE_URL) {
  throw new Error(`PRODUTOS_SERVICE_URL não encontrada em: ${envPath}`);
}
if (!process.env.INTERNAL_API_KEY) {
  throw new Error(`INTERNAL_API_KEY não encontrada em: ${envPath}`);
}
async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  await app.listen(3001);
}
void bootstrap();
