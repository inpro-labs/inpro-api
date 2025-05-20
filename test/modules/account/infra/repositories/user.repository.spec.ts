import { Test, TestingModule } from '@nestjs/testing';
import { PrismaGateway } from '@shared/infra/gateways/prisma.gateway';
import { UserRepository } from '@modules/account/infra/repositories/user.repository.impl';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { Combine, ID } from '@inpro-labs/core';
import { Email } from '@modules/account/domain/value-objects/email.value-object';

const createValidUser = () => {
  const [id, email] = Combine([
    ID.create(),
    Email.create('integration.user@example.com'),
  ]).unwrap();

  return User.create({
    id,
    email,
    password: 'secureIntegrationPass123!',
    verified: false,
  }).unwrap();
};

describe('UserRepositoryImpl (integration)', () => {
  if (!process.env.DATABASE_URL?.includes('inpro_test')) {
    throw new Error('⚠️ Unsafe environment detected for integration tests!');
  }

  let repository: UserRepository;
  let prisma: PrismaGateway;
  let user: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaGateway, UserRepository],
    }).compile();

    prisma = module.get(PrismaGateway);
    repository = module.get(UserRepository);

    user = createValidUser();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await repository.save(user);
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should save and retrieve a user by ID', async () => {
    const found = await repository.findById(user.id.value());

    expect(found.isOk()).toBe(true);
    expect(found.unwrap().id.equals(user.id)).toBe(true);
  });

  it('should retrieve a user by email', async () => {
    const found = await repository.findByEmail(user.get('email').get('value'));

    expect(found.isOk()).toBe(true);
    expect(found.unwrap().get('email').equals(user.get('email'))).toBe(true);
  });

  it('should return error if user not found', async () => {
    const found = await repository.findById('non-existing-id');

    expect(found.isErr()).toBe(true);
    expect(found.getErr()?.message).toContain('User not found');
  });

  it('should update existing user', async () => {
    user.verify();

    const saveResult = await repository.save(user);
    expect(saveResult.isOk()).toBe(true);

    const updatedUser = await repository.findById(user.id.value());
    expect(updatedUser.isOk()).toBe(true);
    expect(updatedUser.unwrap().get('verified')).toBe(true);
  });

  it('should handle saving duplicate emails gracefully', async () => {
    const duplicateUser = createValidUser();

    const result = await repository.save(duplicateUser);
    expect(result.isErr()).toBe(true);
    expect(result.getErr()?.message).toContain('Unique constraint failed');
  });
});
