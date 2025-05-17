// src/repositories/BooksRepositoryImpl.ts
import { injectable } from 'inversify';
import BookModel, { IBookDocument, IBookInput } from '../models/book';
import { BooksRepository } from './BooksRepository';

@injectable()
export class BooksRepositoryImpl extends BooksRepository {
  async createBook(book: IBookInput): Promise<IBookDocument> {
    return BookModel.create(book);
  }

  async getBook(id: string): Promise<IBookDocument | null> {
    return BookModel.findById(id).lean().exec();
  }

  async getBooks(): Promise<IBookDocument[]> {
    return BookModel.find().lean().exec();
  }

  async updateBook(id: string, updatedBook: Partial<IBookInput>): Promise<void> {
    await BookModel.findByIdAndUpdate(id, updatedBook).exec();
  }

  async deleteBook(id: string): Promise<void> {
    await BookModel.findByIdAndDelete(id).exec();
  }
}
