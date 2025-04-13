import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@shared/infra/services/prisma.service';
import { PrismaSessionRepository } from '@modules/auth/infra/repositories/prisma-session.repository';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { RefreshTokenHash } from '@modules/auth/domain/value-objects/refresh-token-hash.value-object';
import { DEVICE_TYPES } from '@shared/constants/devices';
import { Combine, ID } from '@inpro-labs/api-sdk';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { PrismaUserRepository } from '@modules/account/infra/repositories/prisma-user.repository';
import { UserFactory } from '@test/factories/fake-user.factory';

describe('PrismaSessionRepository (integration)', () => {
  if (!process.env.DATABASE_URL?.includes('inpro_test')) {
    throw new Error('⚠️ Unsafe environment detected for integration tests!');
  }

  let repository: PrismaSessionRepository;
  let prisma: PrismaService;
  let userRepository: PrismaUserRepository;
  let user: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, PrismaSessionRepository, PrismaUserRepository],
    }).compile();

    prisma = module.get(PrismaService);
    repository = module.get(PrismaSessionRepository);
    userRepository = module.get(PrismaUserRepository);

    user = UserFactory.make();

    await userRepository.save(user);
  });

  beforeEach(async () => {
    await prisma.session.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  const createValidSession = () => {
    const [id, refreshTokenHash] = Combine([
      ID.create('1'),
      RefreshTokenHash.create('hash'),
    ]).unwrap();

    return Session.create({
      id,
      userId: user.id,
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

    const found = await repository.findById(session.id.value());

    expect(found.isOk()).toBe(true);
    expect(found.unwrap().id.equals(session.id)).toBe(true);
  });

  it('should find active session by device ID', async () => {
    const session = createValidSession();
    console.log(user);
    await repository.save(session);

    const found = await repository.findActiveSessionByDeviceId(
      session.get('deviceId'),
    );

    expect(found.isOk()).toBe(true);
  });
});
