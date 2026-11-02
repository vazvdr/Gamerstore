import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { EmailServiceModule } from './email-service.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(EmailServiceModule);
  app.enableShutdownHooks();
  new Logger('EmailService').log('Email Service iniciado.');
  await app.init();
}
bootstrap().catch((error: unknown) => {
  new Logger('EmailService').error(
    'Falha ao iniciar o Email Service.',
    error instanceof Error ? error.stack : String(error),
  );
  process.exitCode = 1;
});
