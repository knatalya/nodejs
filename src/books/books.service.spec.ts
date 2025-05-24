// src/books/books.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';

import { BooksService } from './books.service';
import { Book, BookDocument } from './schemas/book.schema';
import { CreateBookDto } from './dto/create-book.dto';

describe('BooksService', () => {
  let service: BooksService;
  let model: any;

  const dummyBook = (overrides = {}): Partial<BookDocument> => ({
    _id: '1' as any,
    title: 'Test',
    author: 'Author',
    ...overrides,
  });

  const booksArray = [
    dummyBook({ _id: '1' }),
    dummyBook({ _id: '2', title: 'B' }),
  ];

  let saveMock: jest.Mock;
  let mockBookModel: any;

  beforeEach(async () => {
    saveMock = jest.fn().mockResolvedValue(dummyBook({ _id: '3', title: 'New', author: 'X' }));

    // Делает модель одновременно функцией-конструктором и хранилищем статических методов
    mockBookModel = jest.fn().mockImplementation(dto => ({ ...dto, save: saveMock }));
    mockBookModel.find = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(booksArray) });
    mockBookModel.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(booksArray[0]) });
    mockBookModel.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(booksArray[1]) });
    mockBookModel.findByIdAndDelete = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(booksArray[0]) });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getModelToken(Book.name), useValue: mockBookModel },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    model = module.get(getModelToken(Book.name));
  });

  it('BooksService должен быть определён', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('возвращает массив книг', async () => {
      const result = await service.findAll();
      expect(result).toEqual(booksArray);
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('возвращает книгу по id', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual(booksArray[0]);
      expect(model.findById).toHaveBeenCalledWith('1');
    });

    it('бросает NotFoundException, если не найдено', async () => {
      model.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create', () => {
    it('создаёт и сохраняет новую книгу', async () => {
      const dto: CreateBookDto = { title: 'New', author: 'X' };
      const result = await service.create(dto);
      expect(mockBookModel).toHaveBeenCalledWith(dto);
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual({ _id: '3', title: 'New', author: 'X' });
    });
  });

  describe('update', () => {
    it('обновляет книгу и возвращает новую версию', async () => {
      const dto: CreateBookDto = { title: 'Upd', author: 'Y' };
      const result = await service.update('2', dto);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith('2', dto, { new: true });
      expect(result).toEqual(booksArray[1]);
    });

    it('бросает NotFoundException, если не найдено', async () => {
      model.findByIdAndUpdate.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.update('nope', { title: 'X', author: 'Y' })).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('удаляет книгу', async () => {
      await expect(service.remove('1')).resolves.toBeUndefined();
      expect(model.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    it('бросает NotFoundException, если не найдено', async () => {
      model.findByIdAndDelete.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.remove('nope')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
