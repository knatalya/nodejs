// src/books/books.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';

describe('BooksController', () => {
  let controller: BooksController;

  const mockBooksService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
  });

  it('BooksController должен быть определён', () => {
    expect(controller).toBeDefined();
  });

  // тут можно добавить ещё тесты методов контроллера, например:
  it('findAll вызывает BooksService.findAll', async () => {
    await controller.findAll();
    expect(mockBooksService.findAll).toHaveBeenCalled();
  });

  it('create вызывает BooksService.create', async () => {
    const dto: CreateBookDto = { title: 'T', author: 'A' };
    await controller.create(dto);
    expect(mockBooksService.create).toHaveBeenCalledWith(dto);
  });
});
