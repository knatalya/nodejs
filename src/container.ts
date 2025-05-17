// src/container.ts
import 'reflect-metadata';
import { Container } from 'inversify';
import { BooksRepository } from './repositories/BooksRepository';
import { BooksRepositoryImpl } from './repositories/BooksRepositoryImpl';

// Создаём IoC-контейнер
export const container = new Container();

// Привязываем абстракцию к реализации
container
  .bind<BooksRepository>(BooksRepository)
  .to(BooksRepositoryImpl)
  .inSingletonScope();
