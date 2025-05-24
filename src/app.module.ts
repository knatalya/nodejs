// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { BooksModule } from './books/books.module';
import { SearchModule } from './search/search.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';  // ← импортируем наш модуль

@Module({
  imports: [
    // читаем .env
    ConfigModule.forRoot({ isGlobal: true }),

    // подключаем MongoDB
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost/nestjs-books',
    ),

    // бизнес-модули
    BooksModule,
    SearchModule,
    AuthModule,

    // WebSocket-модуль комментариев
    CommentsModule,  
  ],
})
export class AppModule {}
