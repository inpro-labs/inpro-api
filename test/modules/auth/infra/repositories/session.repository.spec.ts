import { Test, TestingModule } from '@nestjs/testing';
import { PrismaGateway } from '@shared/infra/gateways/prisma.gateway';
import { SessionRepository } from '@modules/auth/infra/repositories/session.repository.impl';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { RefreshTokenHash } from '@modules/auth/domain/value-objects/refresh-token-hash.value-object';
import { DEVICE_TYPES } from '@shared/constants/devices';
import { Combine, ID } from '@inpro-labs/core';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { UserRepository } from '@modules/account/infra/repositories/user.repository.impl';
import { UserFactory } from '@test/factories/fake-user.factory';

describe('SessionRepositoryImpl (integration)', () => {
  if (!process.env.DATABASE_URL?.includes('inpro_test')) {
    throw new Error('⚠️ Unsafe environment detected for integration tests!');
  }

  let repository: SessionRepository;
  let prisma: PrismaGateway;
  let userRepository: UserRepository;
  let user: User;
  let session: Session;

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

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaGateway, SessionRepository, UserRepository],
    }).compile();

    prisma = module.get(PrismaGateway);
    repository = module.get(SessionRepository);
    userRepository = module.get(UserRepository);

    user = UserFactory.make();

    await userRepository.save(user);

    session = createValidSession();
  });

  beforeEach(async () => {
    await prisma.session.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    session = createValidSession();
    await repository.save(session);
  });

  it('should save and retrieve session by ID', async () => {
    const found = await repository.findById(session.id.value());

    expect(found.isOk()).toBe(true);
    expect(found.unwrap().id.equals(session.id)).toBe(true);
  });

  it('should find active session by device ID and user ID', async () => {
    const found = await repository.findActiveSession(
      session.get('deviceId'),
      session.get('userId').value(),
    );

    expect(found.isOk()).toBe(true);
  });
});
