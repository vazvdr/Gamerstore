import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { UsuarioServiceModule } from './usuario-service.module';

async function bootstrap() {
  const app = await NestFactory.create(UsuarioServiceModule);
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  const port = Number(process.env.PORT ?? process.env.port ?? 3003);
  await app.listen(port, '127.0.0.1');
}
void bootstrap();