// create-user.handler.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '@modules/account/domain/interfaces/repositories/user.repository.interface';
import { IHashService } from '@shared/security/hash/interfaces/hash.service.interface';
import { BusinessException } from '@shared/exceptions/business.exception';
import { Email } from '@modules/account/domain/value-objects/email.value-object';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { Ok, Err } from '@inpro-labs/core';
import { CreateUserHandler } from '@modules/account/application/commands/user/create-user.handler';
import { CreateUserCommand } from '@modules/account/application/commands/user/create-user.command';

// Helper to quickly build a valid User aggregate
const buildUser = (email: string, password: string): User =>
  User.create({
    email: Email.create(email).unwrap(),
    password,
  }).unwrap();

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let userRepository: jest.Mocked<IUserRepository>;
  let hashService: jest.Mocked<IHashService>;

  beforeEach(async () => {
    userRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    hashService = {
      generateHash: jest.fn(),
      compare: jest.fn(),
    } as unknown as jest.Mocked<IHashService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserHandler,
        { provide: IUserRepository, useValue: userRepository },
        { provide: IHashService, useValue: hashService },
      ],
    }).compile();

    handler = module.get(CreateUserHandler);
  });

  afterEach(() => jest.resetAllMocks());

  it('should create a user successfully', async () => {
    const email = 'test@example.com';
    const password = 'StrongPass1!';

    userRepository.findByEmail.mockResolvedValue(Err(new Error('not found')));
    hashService.generateHash.mockResolvedValue(Ok('hashedPass'));
    userRepository.save.mockResolvedValue(Ok(buildUser(email, password)));

    const command = new CreateUserCommand({ email, password });

    const result = await handler.execute(command);

    expect(result).toBeInstanceOf(User);
    expect(result.get('email').get('value')).toBe(email);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(hashService.generateHash).toHaveBeenCalledWith(password);
    expect(userRepository.save).toHaveBeenCalledWith(expect.any(User));
  });

  it('should throw if email is invalid', async () => {
    const command = new CreateUserCommand({
      email: 'invalid',
      password: '123',
    });

    await expect(handler.execute(command)).rejects.toThrowError(
      new BusinessException('Invalid email', 'INVALID_EMAIL', 400),
    );
  });

  it('should throw if user already exists', async () => {
    const email = 'exists@example.com';
    const password = '12345678';

    const existingUser = buildUser(email, 'hashed');
    userRepository.findByEmail.mockResolvedValue(Ok(existingUser));

    const command = new CreateUserCommand({ email, password });

    await expect(handler.execute(command)).rejects.toThrowError(
      new BusinessException('User already exists', 'USER_ALREADY_EXISTS', 400),
    );
  });

  it('should propagate error if HashService fails', async () => {
    const email = 'hashfail@example.com';
    const password = 'abc12345';

    userRepository.findByEmail.mockResolvedValue(Err(new Error('not found')));
    hashService.generateHash.mockResolvedValue(Err(new Error('hash-fail')));

    const command = new CreateUserCommand({ email, password });

    await expect(handler.execute(command)).rejects.toThrow(Error);
  });
});
