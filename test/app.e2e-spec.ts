// test/app.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppController } from '../src/app.controller';
import { AppService }    from '../src/app.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Собираем тестовый модуль только с корневым контроллером и сервисом
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 10000); // увеличиваем таймаут на инициализацию до 10 секунд

  afterAll(async () => {
    await app.close();
  });

  it('GET / → Hello World!', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
