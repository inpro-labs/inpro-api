import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '@modules/account/domain/interfaces/repositories/user.repository.interface';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Err, ID, Ok } from '@inpro-labs/core';
import { mock, MockProxy } from 'jest-mock-extended';
import { UserFactory } from '@test/factories/fake-user.factory';
import { SessionFactory } from '@test/factories/fake-session.factory';
import { GetRefreshTokenSessionService } from '@modules/auth/application/services/auth/get-refresh-token-session.service';
import { EncryptService } from '@shared/domain/interfaces/encrypt.service.interface';

describe('GetRefreshTokenSessionService', () => {
  let service: GetRefreshTokenSessionService;
  let encryptService: MockProxy<EncryptService>;
  let userRepository: MockProxy<UserRepository>;
  let sessionRepository: MockProxy<SessionRepository>;

  beforeEach(async () => {
    encryptService = mock<EncryptService>();
    userRepository = mock<UserRepository>();
    sessionRepository = mock<SessionRepository>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRefreshTokenSessionService,
        {
          provide: EncryptService,
          useValue: encryptService,
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

      encryptService.generateHmacDigest.mockReturnValue(Ok(hashedToken));

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

      expect(encryptService.generateHmacDigest).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(sessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        hashedToken,
      );
      expect(userRepository.findById).toHaveBeenCalled();
    });

    it('should return error for invalid refresh token', async () => {
      encryptService.generateHmacDigest.mockReturnValue(Ok(hashedToken));

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

      encryptService.generateHmacDigest.mockReturnValue(Ok(hashedToken));

      sessionRepository.findByRefreshToken.mockResolvedValue(Ok(session));

      Object.defineProperty(session, 'isExpired', { get: () => true });

      const result = await service.execute(refreshToken);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Session is invalid');

      expect(encryptService.generateHmacDigest).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(sessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        hashedToken,
      );
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should return error when user is not found', async () => {
      const session = SessionFactory.make({ id: 'session-123' }).unwrap();

      encryptService.generateHmacDigest.mockReturnValue(Ok(hashedToken));

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

      expect(encryptService.generateHmacDigest).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(sessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        hashedToken,
      );
      expect(userRepository.findById).toHaveBeenCalled();
    });
  });
});
