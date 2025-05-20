import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { CqrsModule } from '@nestjs/cqrs';
import { Ok, Result } from '@inpro-labs/core';
import { HashModule } from '@shared/security/hash/hash.module';
import { ListUserSessionsHandler } from '@modules/auth/application/queries/session/list-user-sessions.handler';
import { ListUserSessionsQuery } from '@modules/auth/application/queries/session/list-user-sessions.query';
import { SessionModel } from '@modules/auth/infra/models/session.model';
import { PrismaGateway } from '@shared/gateways/db/prisma.gateway';
import { ListUserSessionsInputDTO } from '@modules/auth/application/dtos/session/list-user-sessions-input.dto';
import { IListUserSessions } from '@modules/auth/application/interfaces/queries/list-user-sessions.query.interface';

describe('ListUserSessionsHandler', () => {
  let handler: ListUserSessionsHandler;
  let mockListUserSessions: MockProxy<IListUserSessions>;

  const userId = 'user-123';

  const mockSessions: SessionModel[] = [
    {
      id: 'session-1',
      userId,
      device: 'iOS',
      deviceId: 'device-1',
      ip: '127.0.0.1',
      userAgent: 'Test User Agent',
      refreshTokenHash: 'hash1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastRefreshAt: new Date(),
    },
    {
      id: 'session-2',
      userId,
      device: 'Android',
      deviceId: 'device-2',
      ip: '192.168.1.1',
      userAgent: 'Another User Agent',
      refreshTokenHash: 'hash2',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2),
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      updatedAt: new Date(),
      lastRefreshAt: new Date(Date.now() - 1000 * 60 * 30),
    },
  ];

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

    mockListUserSessions.perform.mockResolvedValueOnce(
      Ok({
        data: mockSessions,
        total: mockSessions.length,
        page: 1,
      }),
    );
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
    expect(result.data.length).toBe(mockSessions.length);
    expect(mockListUserSessions.perform).toHaveBeenCalledWith(
      new ListUserSessionsQuery(validDto),
    );
  });
});
