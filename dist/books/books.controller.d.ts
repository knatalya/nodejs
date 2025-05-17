import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Book } from './interfaces/book.interface';
export declare class BooksController {
    private readonly booksService;
    constructor(booksService: BooksService);
    findAll(): Book[];
    findOne(id: string): Book | undefined;
    create(createBookDto: CreateBookDto): Book;
    remove(id: string): void;
}
