import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { CarrinhoServiceModule } from './carrinho-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CarrinhoServiceModule);
  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>('port');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(port, '127.0.0.1');
}
bootstrap();
