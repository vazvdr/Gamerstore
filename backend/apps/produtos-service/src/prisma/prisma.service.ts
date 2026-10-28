import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../../node_modules/.prisma/produtos-client';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const envPaths = [
  path.resolve(process.cwd(), 'backend/apps/produtos-service/.env'),
  path.resolve(process.cwd(), 'apps/produtos-service/.env'),
];
const envPath = envPaths.find((file) => {
  try {
    readFileSync(file);
    return true;
  } catch {
    return false;
  }
});
if (!envPath) {
  throw new Error('Arquivo .env do produtos-service não encontrado.');
}
const env = dotenv.parse(readFileSync(envPath, 'utf8'));

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = env.PRODUTOS_DATABASE_URL;
    if (!connectionString) {
      throw new Error(`PRODUTOS_DATABASE_URL não encontrada em ${envPath}.`);
    }
    super({ adapter: new PrismaPg({ connectionString }) });
  }
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}