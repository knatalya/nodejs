// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { BooksModule } from './books/books.module';
import { SearchModule } from './search/search.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Сначала читаем .env
    ConfigModule.forRoot({
      isGlobal: true,             // чтобы ConfigService был доступен везде
    }),

    // Подключаем MongoDB (берёт URI из process.env.MONGO_URI)
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost/nestjs-books'),

    // Ваши бизнес-модули
    BooksModule,
    SearchModule,
    AuthModule,
  ],
})
export class AppModule {}
