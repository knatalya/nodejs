import { Model } from 'mongoose';
import { Book, BookDocument } from './schemas/book.schema';
import { CreateBookDto } from './dto/create-book.dto';
export declare class BooksService {
    private bookModel;
    constructor(bookModel: Model<BookDocument>);
    findAll(): Promise<Book[]>;
    findOne(id: string): Promise<Book>;
    create(dto: CreateBookDto): Promise<Book>;
    update(id: string, dto: CreateBookDto): Promise<Book>;
    remove(id: string): Promise<void>;
}
