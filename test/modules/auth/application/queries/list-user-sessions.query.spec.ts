import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { CqrsModule } from '@nestjs/cqrs';
import { Result } from '@inpro-labs/core';
import { HashModule } from '@shared/infra/security/hash/hash.module';
import { ListUserSessionsHandler } from '@modules/auth/application/queries/session/list-user-sessions.handler';
import { ListUserSessionsQuery } from '@modules/auth/application/queries/session/list-user-sessions.query';
import { SessionModel } from '@modules/auth/infra/models/session.model';
import { PrismaGateway } from '@shared/infra/gateways/prisma.gateway';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { ListUserSessionsInputDTO } from '@modules/auth/application/dtos/session/list-user-sessions-input.dto';
import { IListUserSessions } from '@modules/auth/application/interfaces/queries/list-user-sessions.query.interface';

describe('ListUserSessionsHandler', () => {
  let handler: ListUserSessionsHandler;
  let mockListUserSessions: MockProxy<IListUserSessions>;
  let prisma: PrismaGateway;

  beforeAll(async () => {
    mockListUserSessions = mock<IListUserSessions>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule, HashModule],
      providers: [
        ListUserSessionsHandler,
        PrismaGateway,
        {
          provide: IListUserSessions,
          useValue: mockListUserSessions,
        },
      ],
    }).compile();

    handler = module.get(ListUserSessionsHandler);
    prisma = module.get(PrismaGateway);

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

  const validDto: ListUserSessionsInputDTO = {
    data: {
      userId: 'user-123',
    },
    pagination: {
      skip: 0,
      take: 10,
    },
  };

  it('should list user sessions', async () => {
    jest.spyOn(mockListUserSessions, 'perform').mockResolvedValueOnce(
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
    const result = await handler.execute(command);

    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBe(1);
    expect(mockListUserSessions.perform).toHaveBeenCalledWith(
      new ListUserSessionsQuery(validDto),
    );
  });
});
