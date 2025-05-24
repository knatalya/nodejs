import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { BooksController } from '../src/books/books.controller';
import { BooksService }    from '../src/books/books.service';
import { CreateBookDto }   from '../src/books/dto/create-book.dto';

describe('BooksController (e2e)', () => {
  let app: INestApplication;

  const mockBooks = [
    { _id: '1', title: 'A', author: 'X' },
    { _id: '2', title: 'B', author: 'Y' },
  ];

  const mockService = {
    findAll: jest.fn().mockResolvedValue(mockBooks),
    findOne: jest.fn().mockImplementation((id: string) =>
      Promise.resolve(mockBooks.find(b => b._id === id))
    ),
    create: jest.fn().mockImplementation((dto: CreateBookDto) =>
      Promise.resolve({ _id: '3', ...dto })
    ),
    update: jest.fn().mockImplementation((id: string, dto: CreateBookDto) =>
      Promise.resolve({ _id: id, ...dto })
    ),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [{ provide: BooksService, useValue: mockService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/books (GET) → массив', () =>
    request(app.getHttpServer())
      .get('/books')
      .expect(200)
      .expect(mockBooks),
  );

  it('/books/:id (GET) → одна', () =>
    request(app.getHttpServer())
      .get('/books/1')
      .expect(200)
      .expect(mockBooks[0]),
  );

  it('/books (POST) → создаёт', () => {
    const dto: CreateBookDto = { title: 'New', author: 'Z' };
    return request(app.getHttpServer())
      .post('/books')
      .send(dto)
      .expect(201)
      .expect({ _id: '3', ...dto });
  });

  it('/books/:id (PUT) → обновляет', () => {
    const dto: CreateBookDto = { title: 'Upd', author: 'W' };
    return request(app.getHttpServer())
      .put('/books/1')
      .send(dto)
      .expect(200)
      .expect({ _id: '1', ...dto });
  });

  it('/books/:id (DELETE) → удаляет', () =>
    request(app.getHttpServer())
      .delete('/books/2')
      .expect(200),
  );
});
