import dotenv from 'dotenv';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

dotenv.config({
  path: path.resolve(process.cwd(), 'backend/apps/produtos-service/.env'),
  override: true,
});

export default defineConfig({
  schema: 'src/prisma/schema.prisma',
  datasource: {
    url: env('PRODUTOS_DATABASE_URL'),
  },
});