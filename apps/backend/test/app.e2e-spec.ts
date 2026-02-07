import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformResponseInterceptor } from '../src/infrastructure/interceptors/transform-response.interceptor';
import { ErrorCode } from '../src/infrastructure/common/enums/error-code.enum';
import { DomainExceptionFilter } from '../src/infrastructure/filters/all-exceptions.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { assertApiResponse } from './utils/assert-api-response';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

describe('AccountController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
    prisma = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      }),
    });
  });

  beforeEach(async () => {
    await prisma.account.deleteMany();
    await prisma.account.createMany({
      data: [
        {
          id: '1',
          balance: 10000, // 100.00 EUR
          currency: 'EUR',
        },
        {
          id: '2',
          balance: 0, // 0.00 EUR
          currency: 'EUR',
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /accounts/transfer', () => {
    it('should execute a valid transfer (Happy Path)', async () => {
      const response = await request(app.getHttpServer())
        .post('/accounts/transfer')
        .send({
          fromAccountId: '1',
          toAccountId: '2',
          amount: 5000,
          currency: 'EUR',
        })
        .expect(201);

      assertApiResponse(response.body);

      // 2. On vérifie que l'Interceptor a bien fait son travail (Wrapper success)
      expect(response.body).toMatchObject({
        success: true,
        data: { message: 'Transfer completed successfully' },
      });
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should fail with INSUFFICIENT_FUNDS (Business Rule)', async () => {
      // On essaie de virer 1000€ (le compte 1 n'a plus assez)
      const response = await request(app.getHttpServer())
        .post('/accounts/transfer')
        .send({
          fromAccountId: '1',
          toAccountId: '2',
          amount: 100000,
          currency: 'EUR',
        })
        .expect(400); // Bad Request

      assertApiResponse(response.body);

      // 3. On vérifie que le Filter a bien fait son travail (ErrorCode)
      expect(response.body).toEqual({
        success: false,
        statusCode: 400,
        errorCode: ErrorCode.INSUFFICIENT_FUNDS,
        message: 'Insufficient funds',
        errors: [],
        timestamp: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
        ) as unknown,
      });
    });

    it('should fail validation with VALIDATION_ERROR (DTO)', async () => {
      const response = await request(app.getHttpServer())
        .post('/accounts/transfer')
        .send({
          fromAccountId: '1',
          toAccountId: '2',
          amount: -50,
          currency: 'ZZ',
        })
        .expect(400);

      assertApiResponse(response.body);

      expect(response.body).toMatchObject({
        success: false,
        statusCode: 400,
        errorCode: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
      });
      if (!response.body.success) {
        expect(response.body.errors).toHaveLength(2);
      } else {
        throw new Error('Expected validation errors, but got success response');
      }
    });

    it('should fail with ACCOUNT_NOT_FOUND when receiver does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/accounts/transfer')
        .send({
          fromAccountId: '1',
          toAccountId: '999',
          amount: 100,
          currency: 'EUR',
        })
        .expect(404);

      assertApiResponse(response.body);
      const body = response.body;

      expect(body.success).toBe(false);
      if (!body.success) {
        expect(body.errorCode).toBe(ErrorCode.ACCOUNT_NOT_FOUND);
        expect(body.message).toContain('not find account');
      }
    });
  });
});
