import { Test, TestingModule } from '@nestjs/testing';
import { PrismaGateway } from '@shared/gateways/db/prisma.gateway';
import { ListUserSessionsQuery } from '@modules/auth/application/queries/session/list-user-sessions.query';
import { SessionModel } from '@modules/auth/infra/db/models/session.model';
import { IListUserSessions } from '@modules/auth/application/interfaces/queries/list-user-sessions.query.interface';
import { ListUserSessions } from '@modules/auth/infra/queries/list-user-sessions.query.impl';

interface TestSessionModel extends SessionModel {
  lastRefreshAt: Date | null;
}

describe('ListUserSessionsQuery', () => {
  let query: IListUserSessions;
  let mockPrismaGateway: {
    session: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  const userId = 'test-user-id';
  const pagination = { skip: 0, take: 10 };

  const mockSessions: TestSessionModel[] = [
    {
      _id: 'session-1',
      userId,
      device: 'iOS',
      deviceId: 'device-1',
      ip: '127.0.0.1',
      userAgent: 'Test User Agent',
      refreshTokenDigest: 'hash1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastRefreshAt: new Date(),
    },
    {
      _id: 'session-2',
      userId,
      device: 'Android',
      deviceId: 'device-2',
      ip: '192.168.1.1',
      userAgent: 'Another User Agent',
      refreshTokenDigest: 'hash2',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2),
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      updatedAt: new Date(),
      lastRefreshAt: new Date(Date.now() - 1000 * 60 * 30),
    },
  ];

  beforeEach(async () => {
    mockPrismaGateway = {
      session: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: IListUserSessions,
          useClass: ListUserSessions,
        },
        {
          provide: PrismaGateway,
          useValue: mockPrismaGateway,
        },
      ],
    }).compile();

    query = module.get<IListUserSessions>(IListUserSessions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('perform', () => {
    it('should return paginated sessions for a user', async () => {
      const queryDto = new ListUserSessionsQuery({
        data: { userId },
        pagination,
      });

      mockPrismaGateway.session.findMany.mockResolvedValue(mockSessions);
      mockPrismaGateway.session.count.mockResolvedValue(mockSessions.length);

      const result = await query.perform(queryDto);

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const paginatedResult = result.unwrap();

        expect(paginatedResult.data).toEqual(mockSessions);
        expect(paginatedResult.total).toBe(mockSessions.length);
        expect(paginatedResult.page).toBe(1);
      }

      expect(mockPrismaGateway.session.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { lastRefreshAt: 'desc' },
      });
    });

    it('should handle pagination correctly', async () => {
      const pageSize = 5;
      const customPagination = { skip: pageSize, take: pageSize };

      const queryDto = new ListUserSessionsQuery({
        data: { userId },
        pagination: customPagination,
      });

      mockPrismaGateway.session.findMany.mockResolvedValue(mockSessions);

      const result = await query.perform(queryDto);

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const paginatedResult = result.unwrap();
        expect(paginatedResult.page).toBe(2);
      }

      expect(mockPrismaGateway.session.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: customPagination.skip,
        take: customPagination.take,
        orderBy: { lastRefreshAt: 'desc' },
      });
    });

    it('should handle empty results', async () => {
      const queryDto = new ListUserSessionsQuery({
        data: { userId },
        pagination,
      });

      mockPrismaGateway.session.findMany.mockResolvedValue([]);
      mockPrismaGateway.session.count.mockResolvedValue(0);

      const result = await query.perform(queryDto);

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const paginatedResult = result.unwrap();
        expect(paginatedResult.data).toEqual([]);
        expect(paginatedResult.total).toBe(0);
        expect(paginatedResult.page).toBe(1);
      }

      expect(mockPrismaGateway.session.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { lastRefreshAt: 'desc' },
      });
    });

    it('should return error when prisma throws exception', async () => {
      const queryDto = new ListUserSessionsQuery({
        data: { userId },
        pagination,
      });

      const expectedError = new Error('Database error');

      mockPrismaGateway.session.findMany.mockRejectedValue(expectedError);

      const result = await query.perform(queryDto);

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.getErr()).toBe(expectedError);
      }

      expect(mockPrismaGateway.session.findMany).toHaveBeenCalled();
    });
  });
});
