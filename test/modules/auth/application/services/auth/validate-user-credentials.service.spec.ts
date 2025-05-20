import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '@modules/account/domain/interfaces/repositories/user.repository.interface';
import { HashService } from '@shared/domain/interfaces/hash.service.interface';
import { Err, Ok } from '@inpro-labs/core';
import { mock, MockProxy } from 'jest-mock-extended';
import { UserFactory } from '@test/factories/fake-user.factory';
import { ValidateUserCredentialsService } from '@modules/auth/application/services/auth/validate-user-credentials.service';

describe('ValidateUserCredentialsService', () => {
  let service: ValidateUserCredentialsService;
  let hashService: MockProxy<HashService>;
  let userRepository: MockProxy<IUserRepository>;

  beforeEach(async () => {
    hashService = mock<HashService>();
    userRepository = mock<IUserRepository>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateUserCredentialsService,
        {
          provide: HashService,
          useValue: hashService,
        },
        {
          provide: IUserRepository,
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<ValidateUserCredentialsService>(
      ValidateUserCredentialsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should validate user credentials successfully', async () => {
      const user = UserFactory.make('user-123');

      userRepository.findByEmail.mockResolvedValue(Ok(user));

      hashService.compareHash.mockResolvedValue(Ok(true));

      const result = await service.execute(password, email);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(user);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(hashService.compareHash).toHaveBeenCalled();
    });

    it('should return error when user is not found', async () => {
      userRepository.findByEmail.mockResolvedValue(
        Err(new Error('User not found')),
      );

      const result = await service.execute(password, email);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Invalid credentials');

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(hashService.compareHash).not.toHaveBeenCalled();
    });

    it('should return error when passwords do not match', async () => {
      const user = UserFactory.make('user-123');

      userRepository.findByEmail.mockResolvedValue(Ok(user));

      hashService.compareHash.mockResolvedValue(Ok(false));

      const result = await service.execute(password, email);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Invalid credentials');

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(hashService.compareHash).toHaveBeenCalled();
    });
  });
});
