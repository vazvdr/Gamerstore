import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FreteServiceModule } from './frete-service.module';

async function bootstrap() {
  const app = await NestFactory.create(FreteServiceModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('GamerStore - Frete Service')
    .setDescription('API para cálculo de frete por CEP.')
    .setVersion('1.0')
    .addTag('Fretes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(Number(process.env.PORT ?? 3006));
}
bootstrap();
