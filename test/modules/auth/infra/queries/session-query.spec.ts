import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@shared/infra/services/prisma.service';
import { SessionQueryService } from '@modules/auth/application/interfaces/queries/session-query.service.interface';
import { SessionQueryServiceImpl } from '@modules/auth/infra/queries/session-query.impl';
import { ListUserSessionsQuery } from '@modules/auth/application/queries/session/list-user-sessions.query';
import { SessionModel } from '@modules/auth/infra/models/session.model';

// Extended model for testing with optional lastRefreshAt
interface TestSessionModel extends SessionModel {
  lastRefreshAt?: Date;
}

describe('SessionQueryService', () => {
  let service: SessionQueryService;
  let prismaService: PrismaService;
  let mockSessionService: { findMany: jest.Mock };

  const userId = 'test-user-id';
  const pagination = { skip: 0, take: 10 };

  // Mock session data
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
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
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
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
      createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      updatedAt: new Date(),
      lastRefreshAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
  ];

  beforeEach(async () => {
    // Create session mock
    mockSessionService = {
      findMany: jest.fn(),
    };

    // Create a mock PrismaService that properly types session
    prismaService = {
      session: mockSessionService,
    } as unknown as PrismaService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SessionQueryService,
          useClass: SessionQueryServiceImpl,
        },
        {
          provide: PrismaService,
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
      // Setup the query
      const query = new ListUserSessionsQuery({
        data: { userId },
        pagination,
      });

      // Setup mock to return sessions
      mockSessionService.findMany.mockResolvedValue(mockSessions);

      // Call the service method
      const result = await service.listUserSessions(query);

      // Verify the result
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        // Type guard to avoid unbound method issue
        const paginatedResult = result.unwrap();

        expect(paginatedResult.data).toEqual(mockSessions);
        expect(paginatedResult.total).toBe(mockSessions.length);
        expect(paginatedResult.page).toBe(1); // First page (skip 0, take 10)
      }

      // Verify prisma was called with correct parameters
      expect(mockSessionService.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { lastRefreshAt: 'desc' },
      });
    });

    it('should handle pagination correctly', async () => {
      // Setup pagination parameters for page 2
      const pageSize = 5;
      const customPagination = { skip: pageSize, take: pageSize }; // Page 2

      // Setup the query
      const query = new ListUserSessionsQuery({
        data: { userId },
        pagination: customPagination,
      });

      // Setup mock to return sessions
      mockSessionService.findMany.mockResolvedValue(mockSessions);

      // Call the service method
      const result = await service.listUserSessions(query);

      // Verify the result
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        // Type guard to avoid unbound method issue
        const paginatedResult = result.unwrap();
        expect(paginatedResult.page).toBe(2); // Second page
      }

      // Verify prisma was called with correct parameters
      expect(mockSessionService.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: customPagination.skip,
        take: customPagination.take,
        orderBy: { lastRefreshAt: 'desc' },
      });
    });

    it('should handle empty results', async () => {
      // Setup the query
      const query = new ListUserSessionsQuery({
        data: { userId },
        pagination,
      });

      // Setup mock to return empty array
      mockSessionService.findMany.mockResolvedValue([]);

      // Call the service method
      const result = await service.listUserSessions(query);

      // Verify the result
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        // Type guard to avoid unbound method issue
        const paginatedResult = result.unwrap();
        expect(paginatedResult.data).toEqual([]);
        expect(paginatedResult.total).toBe(0);
        expect(paginatedResult.page).toBe(1);
      }

      // Verify prisma was called with correct parameters
      expect(mockSessionService.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { lastRefreshAt: 'desc' },
      });
    });

    it('should return error when prisma throws exception', async () => {
      // Setup the query
      const query = new ListUserSessionsQuery({
        data: { userId },
        pagination,
      });

      // Setup the error
      const expectedError = new Error('Database error');

      // Setup mock to throw error
      mockSessionService.findMany.mockRejectedValue(expectedError);

      // Call the service method
      const result = await service.listUserSessions(query);

      // Verify the result
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        // Type guard to avoid unbound method issue
        expect(result.getErr()).toBe(expectedError);
      }

      // Verify prisma was called
      expect(mockSessionService.findMany).toHaveBeenCalled();
    });
  });
});
