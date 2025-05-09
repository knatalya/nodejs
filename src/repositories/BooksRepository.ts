// src/repositories/BooksRepository.ts
import { IBook } from '../models/book';

export abstract class BooksRepository {
  /** Создать книгу */
  abstract createBook(book: IBook): void;

  /** Вернуть книгу по ID или null */
  abstract getBook(id: string): IBook | null;

  /** Вернуть все книги */
  abstract getBooks(): IBook[];

  /** Обновить книгу */
  abstract updateBook(id: string, updatedBook: IBook): void;

  /** Удалить книгу */
  abstract deleteBook(id: string): void;
}
