/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { CqrsModule } from '@nestjs/cqrs';
import { Result } from '@inpro-labs/api-sdk';
import { HashModule } from '@shared/infra/security/hash/hash.module';
import { ListUserSessionsHandler } from '@modules/auth/application/queries/session/list-user-sessions.handler';
import { ListUserSessionsDto } from '@modules/auth/application/dtos/session/list-user-sessions.dto';
import { ListUserSessionsQuery } from '@modules/auth/application/queries/session/list-user-sessions.query';
import { SessionModel } from '@modules/auth/infra/models/session.model';
import { SessionQueryService } from '@modules/auth/application/interfaces/queries/session-query.service.interface';
import { PrismaService } from '@shared/infra/services/prisma.service';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';

describe('ListUserSessionsHandler', () => {
  let handler: ListUserSessionsHandler;
  let sessionQueryService: MockProxy<SessionQueryService>;
  let prisma: PrismaService;

  beforeAll(async () => {
    sessionQueryService = mock<SessionQueryService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule, HashModule],
      providers: [
        ListUserSessionsHandler,
        {
          provide: SessionQueryService,
          useValue: sessionQueryService,
        },
        PrismaService,
      ],
    }).compile();

    handler = module.get(ListUserSessionsHandler);
    prisma = module.get(PrismaService);

    const userId = 'user-123';
    await prisma.user.create({
      data: {
        email: 'test@test.com',
        password: 'password',
        id: userId,
      },
    });

    await prisma.session.create({
      data: {
        id: 'session-123',
        userId,
        deviceId: 'device-123',
        refreshTokenHash: 'refresh-token',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        device: Session.deviceTypes[0],
        ip: '127.0.0.1',
        userAgent: 'test',
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.session.deleteMany();
    await prisma.$disconnect();
  });

  const validDto: ListUserSessionsDto = {
    data: {
      userId: 'user-123',
    },
    pagination: {
      skip: 0,
      take: 10,
    },
  };

  it('should list user sessions', async () => {
    jest.spyOn(sessionQueryService, 'listUserSessions').mockResolvedValueOnce(
      new Result(
        {
          data: [
            {
              id: 'session-123',
            } as unknown as SessionModel,
          ],
          total: 1,
          page: 1,
        },
        null,
      ),
    );

    const command = new ListUserSessionsQuery(validDto);
    const data = await handler.execute(command);

    expect(data).toBeInstanceOf(Array);
    expect(data.data.length).toBe(1);
    expect(sessionQueryService.listUserSessions).toHaveBeenCalledWith(
      new ListUserSessionsQuery(validDto),
    );
  });
});
