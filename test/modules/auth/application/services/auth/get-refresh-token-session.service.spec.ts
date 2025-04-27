import { Test, TestingModule } from '@nestjs/testing';
import { HashService } from '@shared/domain/interfaces/hash.service.interface';
import { UserRepository } from '@modules/account/domain/interfaces/repositories/user.repository.interface';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Err, ID, Ok } from '@inpro-labs/core';
import { mock, MockProxy } from 'jest-mock-extended';
import { UserFactory } from '@test/factories/fake-user.factory';
import { SessionFactory } from '@test/factories/fake-session.factory';
import { GetRefreshTokenSessionService } from '@modules/auth/application/services/auth/get-refresh-token-session.service';

describe('GetRefreshTokenSessionService', () => {
  let service: GetRefreshTokenSessionService;
  let hashService: MockProxy<HashService>;
  let userRepository: MockProxy<UserRepository>;
  let sessionRepository: MockProxy<SessionRepository>;

  beforeEach(async () => {
    hashService = mock<HashService>();
    userRepository = mock<UserRepository>();
    sessionRepository = mock<SessionRepository>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRefreshTokenSessionService,
        {
          provide: HashService,
          useValue: hashService,
        },
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: SessionRepository,
          useValue: sessionRepository,
        },
      ],
    }).compile();

    service = module.get<GetRefreshTokenSessionService>(
      GetRefreshTokenSessionService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const refreshToken = 'refresh-token';
    const hashedToken = 'hashed-refresh-token';

    it('should retrieve session and user by refresh token', async () => {
      const session = SessionFactory.make({ id: 'session-123' }).unwrap();
      const user = UserFactory.make('user-123');

      hashService.generateHash.mockResolvedValue(Ok(hashedToken));

      sessionRepository.findByRefreshToken.mockResolvedValue(Ok(session));

      Object.defineProperty(session, 'isExpired', { get: () => false });
      Object.defineProperty(session, 'isRevoked', { get: () => false });

      userRepository.findById.mockResolvedValue(Ok(user));

      const mockIdValue = jest.fn().mockReturnValue('user-123');
      jest.spyOn(ID.prototype, 'value').mockImplementation(mockIdValue);

      const result = await service.execute(refreshToken);

      expect(result.isOk()).toBe(true);
      const data = result.unwrap();
      expect(data.session).toBe(session);
      expect(data.user).toBe(user);

      expect(hashService.generateHash).toHaveBeenCalledWith(refreshToken);
      expect(sessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        hashedToken,
      );
      expect(userRepository.findById).toHaveBeenCalled();
    });

    it('should return error for invalid refresh token', async () => {
      hashService.generateHash.mockResolvedValue(Ok(hashedToken));

      sessionRepository.findByRefreshToken.mockResolvedValue(
        Err(new Error('Session not found')),
      );

      const result = await service.execute(refreshToken);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Invalid refresh token');

      expect(sessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        hashedToken,
      );
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should return error for expired or revoked session', async () => {
      const session = SessionFactory.make({ id: 'session-123' }).unwrap();

      hashService.generateHash.mockResolvedValue(Ok(hashedToken));

      sessionRepository.findByRefreshToken.mockResolvedValue(Ok(session));

      Object.defineProperty(session, 'isExpired', { get: () => true });

      const result = await service.execute(refreshToken);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Session is invalid');

      expect(hashService.generateHash).toHaveBeenCalledWith(refreshToken);
      expect(sessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        hashedToken,
      );
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should return error when user is not found', async () => {
      const session = SessionFactory.make({ id: 'session-123' }).unwrap();

      hashService.generateHash.mockResolvedValue(Ok(hashedToken));

      sessionRepository.findByRefreshToken.mockResolvedValue(Ok(session));

      Object.defineProperty(session, 'isExpired', { get: () => false });
      Object.defineProperty(session, 'isRevoked', { get: () => false });

      userRepository.findById.mockResolvedValue(
        Err(new Error('User not found')),
      );

      const mockIdValue = jest.fn().mockReturnValue('user-123');
      jest.spyOn(ID.prototype, 'value').mockImplementation(mockIdValue);

      const result = await service.execute(refreshToken);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('User not found');

      expect(hashService.generateHash).toHaveBeenCalledWith(refreshToken);
      expect(sessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        hashedToken,
      );
      expect(userRepository.findById).toHaveBeenCalled();
    });
  });
});
