// src/books/books.service.ts
import { Injectable } from '@nestjs/common';
import { Book } from './interfaces/book.interface';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {
  private books: Book[] = [];

  findAll(): Book[] {
    return this.books;
  }

  findOne(id: string): Book | undefined {
    return this.books.find(book => book.id === id);
  }

  create(createBookDto: CreateBookDto): Book {
    const newBook: Book = {
      id: (this.books.length + 1).toString(),
      ...createBookDto,
    };
    this.books.push(newBook);
    return newBook;
  }

  remove(id: string): void {
    this.books = this.books.filter(book => book.id !== id);
  }
}
