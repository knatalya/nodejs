// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BooksModule } from './books/books.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nestjs-books'),
    BooksModule,
    SearchModule,
  ],
})
export class AppModule {}