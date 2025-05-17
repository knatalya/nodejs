// src/books/dto/create-book.dto.ts
export class CreateBookDto {
  readonly title: string;
  readonly author: string;
}

// src/books/interfaces/book.interface.ts
export interface Book {
  id: string;
  title: string;
  author: string;
}
