import { Book } from './interfaces/book.interface';
import { CreateBookDto } from './dto/create-book.dto';
export declare class BooksService {
    private books;
    findAll(): Book[];
    findOne(id: string): Book | undefined;
    create(createBookDto: CreateBookDto): Book;
    remove(id: string): void;
}
