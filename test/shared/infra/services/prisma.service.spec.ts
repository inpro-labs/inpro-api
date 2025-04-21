import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@shared/infra/services/prisma.service';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = jest.fn().mockImplementation(() => ({
    $connect: jest.fn().mockResolvedValue(undefined),
  }));
  return { PrismaClient: mockPrismaClient };
});

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to the database on module initialization', async () => {
      // Spy on the $connect method
      const connectSpy = jest.spyOn(service, '$connect');

      // Call onModuleInit
      await service.onModuleInit();

      // Verify connection was attempted
      expect(connectSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database connection fails', async () => {
      // Mock connection failure
      jest
        .spyOn(service, '$connect')
        .mockRejectedValueOnce(new Error('Connection failed'));

      // Expect onModuleInit to throw
      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });
});
