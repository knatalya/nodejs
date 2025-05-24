// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Глобальный interceptor для обёртки ответов
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Глобальный pipe для валидации DTO
  app.useGlobalPipes(new ValidationPipe());

  // Глобальный filter для форматирования ошибок
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3000);
}
bootstrap();