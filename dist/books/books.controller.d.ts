import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Book } from './schemas/book.schema';
export declare class BooksController {
    private readonly booksService;
    constructor(booksService: BooksService);
    findAll(): Promise<Book[]>;
    findOne(id: string): Promise<Book>;
    create(dto: CreateBookDto): Promise<Book>;
    update(id: string, dto: CreateBookDto): Promise<Book>;
    remove(id: string): Promise<void>;
}
