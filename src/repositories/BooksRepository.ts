// src/repositories/BooksRepository.ts
import { IBookInput, IBookDocument } from '../models/book';

export abstract class BooksRepository {
  /** Создать книгу */
  abstract createBook(book: IBookInput): Promise<IBookDocument>;

  /** Вернуть книгу по ID или null */
  abstract getBook(id: string): Promise<IBookDocument | null>;

  /** Вернуть все книги */
  abstract getBooks(): Promise<IBookDocument[]>;

  /** Обновить книгу */
  abstract updateBook(id: string, updatedBook: Partial<IBookInput>): Promise<void>;

  /** Удалить книгу */
  abstract deleteBook(id: string): Promise<void>;
}