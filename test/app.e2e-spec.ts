// file: test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// Увеличиваем таймаут, чтобы успевало поднимать БД/приложение
jest.setTimeout(30000);

describe('App e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/common/hotel-rooms (GET) should return empty array initially', () => {
    return request(app.getHttpServer())
      .get('/api/common/hotel-rooms')
      .expect(200)
      .expect([]);
  });

  it('/api/client/register and login flow', () => {
    const email = `test${Date.now()}@example.com`;
    return request(app.getHttpServer())
      .post('/api/client/register')
      .send({ email, password: 'pass123', name: 'Test' })
      .expect(201)
      .then(() =>
        request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email, password: 'pass123' })
          .expect(201)
          .expect((res) => {
            expect(res.body.access_token).toBeDefined();
          }),
      );
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
