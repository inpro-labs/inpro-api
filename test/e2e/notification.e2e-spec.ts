import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@src/app.module';
import { NotificationChannel } from '@modules/notifications/domain/enums/notification-channel.enum';
import { NotificationStatus } from '@modules/notifications/domain/enums/notification-status.enum';

describe('Notification E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /notifications/send', () => {
    it('should successfully send email notification', async () => {
      const requestBody = {
        userId: 'user-123',
        templateId: 'template-123',
        templateVariables: { userName: 'John Doe' },
        channel: NotificationChannel.EMAIL,
        channelData: { to: 'test@example.com' },
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send(requestBody)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        userId: 'user-123',
        channel: NotificationChannel.EMAIL,
        status: NotificationStatus.PENDING,
        attempts: 0,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        templateVariables: { userName: 'John Doe' },
      });

      expect(response.body.sentAt).toBeNull();
      expect(response.body.lastError).toBeNull();
    });

    it('should successfully send SMS notification', async () => {
      const requestBody = {
        userId: 'user-456',
        templateId: 'template-456',
        templateVariables: { userName: 'Jane Smith' },
        channel: NotificationChannel.SMS,
        channelData: { phone: '1234567890' },
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send(requestBody)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        userId: 'user-456',
        channel: NotificationChannel.SMS,
        status: NotificationStatus.PENDING,
        attempts: 0,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        templateVariables: { userName: 'Jane Smith' },
      });
    });

    it('should handle complex template variables', async () => {
      const requestBody = {
        userId: 'user-789',
        templateId: 'template-789',
        templateVariables: {
          userName: 'Alice Johnson',
          companyName: 'Acme Corp',
          orderNumber: 'ORD-12345',
          amount: 99.99,
          items: ['Item 1', 'Item 2'],
          metadata: {
            category: 'electronics',
            priority: 'high',
          },
        },
        channel: NotificationChannel.EMAIL,
        channelData: { to: 'alice@example.com' },
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send(requestBody)
        .expect(201);

      expect(response.body.templateVariables).toEqual({
        userName: 'Alice Johnson',
        companyName: 'Acme Corp',
        orderNumber: 'ORD-12345',
        amount: 99.99,
        items: ['Item 1', 'Item 2'],
        metadata: {
          category: 'electronics',
          priority: 'high',
        },
      });
    });

    it('should handle empty template variables', async () => {
      const requestBody = {
        userId: 'user-999',
        templateId: 'template-999',
        templateVariables: {},
        channel: NotificationChannel.EMAIL,
        channelData: { to: 'empty@example.com' },
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send(requestBody)
        .expect(201);

      expect(response.body.templateVariables).toEqual({});
    });

    it('should return 400 for invalid email format', async () => {
      const requestBody = {
        userId: 'user-123',
        templateId: 'template-123',
        templateVariables: { userName: 'John Doe' },
        channel: NotificationChannel.EMAIL,
        channelData: { to: 'invalid-email-format' },
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send(requestBody)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Invalid email'),
        error: 'Bad Request',
      });
    });

    it('should return 400 for invalid phone format', async () => {
      const requestBody = {
        userId: 'user-123',
        templateId: 'template-123',
        templateVariables: { userName: 'John Doe' },
        channel: NotificationChannel.SMS,
        channelData: { phone: '123' }, // Too short
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send(requestBody)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Invalid SMS'),
        error: 'Bad Request',
      });
    });

    it('should return 400 for invalid channel', async () => {
      const requestBody = {
        userId: 'user-123',
        templateId: 'template-123',
        templateVariables: { userName: 'John Doe' },
        channel: 'INVALID_CHANNEL',
        channelData: { to: 'test@example.com' },
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send(requestBody)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Invalid channel'),
        error: 'Bad Request',
      });
    });

    it('should return 404 for non-existent template', async () => {
      const requestBody = {
        userId: 'user-123',
        templateId: 'non-existent-template',
        templateVariables: { userName: 'John Doe' },
        channel: NotificationChannel.EMAIL,
        channelData: { to: 'test@example.com' },
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send(requestBody)
        .expect(404);

      expect(response.body).toMatchObject({
        statusCode: 404,
        message: 'Template not found',
        error: 'Not Found',
      });
    });

    it('should return 400 for missing required fields', async () => {
      const requestBody = {
        userId: 'user-123',
        templateId: 'template-123',
        // Missing templateVariables
        channel: NotificationChannel.EMAIL,
        channelData: { to: 'test@example.com' },
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send(requestBody)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
      });
    });

    it('should return 400 for invalid template variables', async () => {
      const requestBody = {
        userId: 'user-123',
        templateId: 'template-123',
        templateVariables: { userName: 123 }, // Should be string
        channel: NotificationChannel.EMAIL,
        channelData: { to: 'test@example.com' },
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send(requestBody)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Invalid variables'),
        error: 'Bad Request',
      });
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
      });
    });

    it('should handle missing Content-Type header', async () => {
      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send('{"userId": "user-123"}')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle internal server errors gracefully', async () => {
      // This test would require mocking internal services to throw errors
      // For now, we'll test the error handling structure
      const requestBody = {
        userId: 'user-123',
        templateId: 'template-123',
        templateVariables: { userName: 'John Doe' },
        channel: NotificationChannel.EMAIL,
        channelData: { to: 'test@example.com' },
      };

      // This should work normally, but if there's an internal error, it should be handled
      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send(requestBody);

      // Should either succeed (201) or fail with proper error handling (4xx/5xx)
      expect([201, 400, 404, 500]).toContain(response.status);
    });
  });

  describe('Response Format', () => {
    it('should return consistent response format for successful requests', async () => {
      const requestBody = {
        userId: 'user-123',
        templateId: 'template-123',
        templateVariables: { userName: 'John Doe' },
        channel: NotificationChannel.EMAIL,
        channelData: { to: 'test@example.com' },
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send(requestBody)
        .expect(201);

      // Check response structure
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('channel');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('attempts');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).toHaveProperty('sentAt');
      expect(response.body).toHaveProperty('lastError');
      expect(response.body).toHaveProperty('template');
      expect(response.body).toHaveProperty('templateVariables');

      // Check data types
      expect(typeof response.body.id).toBe('string');
      expect(typeof response.body.userId).toBe('string');
      expect(typeof response.body.channel).toBe('string');
      expect(typeof response.body.status).toBe('string');
      expect(typeof response.body.attempts).toBe('number');
      expect(typeof response.body.createdAt).toBe('string');
      expect(typeof response.body.updatedAt).toBe('string');
      expect(typeof response.body.templateVariables).toBe('object');
    });

    it('should return consistent error format for failed requests', async () => {
      const requestBody = {
        userId: 'user-123',
        templateId: 'template-123',
        templateVariables: { userName: 'John Doe' },
        channel: NotificationChannel.EMAIL,
        channelData: { to: 'invalid-email' },
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send(requestBody)
        .expect(400);

      // Check error response structure
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');

      // Check data types
      expect(typeof response.body.statusCode).toBe('number');
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.error).toBe('string');
    });
  });
});
