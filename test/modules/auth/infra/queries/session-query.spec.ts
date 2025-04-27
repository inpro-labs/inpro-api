import { Test, TestingModule } from '@nestjs/testing';
import { PrismaGateway } from '@shared/infra/gateways/prisma.gateway';
import { SessionQueryService } from '@modules/auth/application/interfaces/queries/session-query.service.interface';
import { SessionQueryServiceImpl } from '@modules/auth/infra/services/session-query.service.impl';
import { ListUserSessionsQuery } from '@modules/auth/application/queries/session/list-user-sessions.query';
import { SessionModel } from '@modules/auth/infra/models/session.model';

interface TestSessionModel extends SessionModel {
  lastRefreshAt?: Date;
}

describe('SessionQueryService', () => {
  let service: SessionQueryService;
  let prismaService: PrismaGateway;
  let mockSessionService: { findMany: jest.Mock };

  const userId = 'test-user-id';
  const pagination = { skip: 0, take: 10 };

  const mockSessions: TestSessionModel[] = [
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

  beforeEach(async () => {
    mockSessionService = {
      findMany: jest.fn(),
    };

    prismaService = {
      session: mockSessionService,
    } as unknown as PrismaGateway;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SessionQueryService,
          useClass: SessionQueryServiceImpl,
        },
        {
          provide: PrismaGateway,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<SessionQueryService>(SessionQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listUserSessions', () => {
    it('should return paginated sessions for a user', async () => {
      const query = new ListUserSessionsQuery({
        data: { userId },
        pagination,
      });

      mockSessionService.findMany.mockResolvedValue(mockSessions);

      const result = await service.listUserSessions(query);

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const paginatedResult = result.unwrap();

        expect(paginatedResult.data).toEqual(mockSessions);
        expect(paginatedResult.total).toBe(mockSessions.length);
        expect(paginatedResult.page).toBe(1);
      }

      expect(mockSessionService.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { lastRefreshAt: 'desc' },
      });
    });

    it('should handle pagination correctly', async () => {
      const pageSize = 5;
      const customPagination = { skip: pageSize, take: pageSize };

      const query = new ListUserSessionsQuery({
        data: { userId },
        pagination: customPagination,
      });

      mockSessionService.findMany.mockResolvedValue(mockSessions);

      const result = await service.listUserSessions(query);

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const paginatedResult = result.unwrap();
        expect(paginatedResult.page).toBe(2);
      }

      expect(mockSessionService.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: customPagination.skip,
        take: customPagination.take,
        orderBy: { lastRefreshAt: 'desc' },
      });
    });

    it('should handle empty results', async () => {
      const query = new ListUserSessionsQuery({
        data: { userId },
        pagination,
      });

      mockSessionService.findMany.mockResolvedValue([]);

      const result = await service.listUserSessions(query);

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const paginatedResult = result.unwrap();
        expect(paginatedResult.data).toEqual([]);
        expect(paginatedResult.total).toBe(0);
        expect(paginatedResult.page).toBe(1);
      }

      expect(mockSessionService.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { lastRefreshAt: 'desc' },
      });
    });

    it('should return error when prisma throws exception', async () => {
      const query = new ListUserSessionsQuery({
        data: { userId },
        pagination,
      });

      const expectedError = new Error('Database error');

      mockSessionService.findMany.mockRejectedValue(expectedError);

      const result = await service.listUserSessions(query);

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.getErr()).toBe(expectedError);
      }

      expect(mockSessionService.findMany).toHaveBeenCalled();
    });
  });
});
