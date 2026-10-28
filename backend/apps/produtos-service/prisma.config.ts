
import { defineConfig, env } from 'prisma/config';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(configDir, '.env') });

export default defineConfig({
  schema: 'src/prisma/schema.prisma',
  migrations: {
    path: 'src/prisma/migrations',
  },
  datasource: {
    url: env('PRODUTOS_DATABASE_URL'),
  },
});
