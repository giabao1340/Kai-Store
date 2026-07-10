import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // main.ts
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://kai-store-psi.vercel.app', // ← thêm domain Vercel
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3001);
  process.env.PORT
    ? console.log(`Server is running on port ${process.env.PORT}`)
    : console.log(`Server is running on port 3001`);
}
bootstrap();
