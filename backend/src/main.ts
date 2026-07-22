import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // main.ts
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://kai-store-psi.vercel.app', // chỉ định domain frontend của bạn
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  // main.ts — đảm bảo whitelist: true
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ← xóa field không có trong DTO
      forbidNonWhitelisted: true, // ← báo lỗi nếu gửi field lạ
      transform: true,
    }),
  );
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'res.cloudinary.com', 'data:'],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  await app.listen(process.env.PORT || 3001);
  console.log('🚀 Server running on http://localhost:3001');
}
bootstrap();
