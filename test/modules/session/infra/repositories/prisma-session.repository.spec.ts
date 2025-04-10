import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@shared/infra/services/prisma.service';
import { PrismaSessionRepository } from '@modules/session/infra/repositories/prisma-session.repository';
import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { RefreshTokenHash } from '@modules/session/domain/value-objects/refresh-token-hash.value-object';
import { DEVICE_TYPES } from '@shared/constants/devices';
import { Combine, ID } from '@inpro-labs/api-sdk';

describe('PrismaSessionRepository (integration)', () => {
  if (!process.env.DATABASE_URL?.includes('inpro_test')) {
    throw new Error('⚠️ Unsafe environment detected for integration tests!');
  }

  let repository: PrismaSessionRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, PrismaSessionRepository],
    }).compile();

    repository = module.get(PrismaSessionRepository);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.session.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const createValidSession = () => {
    const [id, userId, refreshTokenHash] = Combine([
      ID.create('1'),
      ID.create('2'),
      RefreshTokenHash.create('hash'),
    ]).unwrap();

    return Session.create({
      id,
      userId,
      refreshTokenHash,
      device: DEVICE_TYPES.IOS,
      userAgent: 'agent',
      ip: '127.0.0.1',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000),
      updatedAt: new Date(),
      deviceId: 'test-device-id',
    }).unwrap();
  };

  it('should save and retrieve session by ID', async () => {
    const session = createValidSession();

    await repository.save(session);

    console.log('saved session', session);

    const found = await repository.findById(session.id.value());

    expect(found.isOk()).toBe(true);
    expect(found.unwrap().id.equals(session.id)).toBe(true);
  });

  it('should find active session by device ID', async () => {
    const session = createValidSession();

    await repository.save(session);

    const found = await repository.findActiveSessionByDeviceId(
      session.get('deviceId'),
    );

    expect(found.isOk()).toBe(true);
  });
});
