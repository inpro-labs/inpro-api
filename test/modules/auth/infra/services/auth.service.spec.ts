import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '@shared/domain/interfaces/hash.service.interface';
import { UserRepository } from '@modules/account/domain/interfaces/repositories/user.repository.interface';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { AuthServiceImpl } from '@modules/auth/infra/services/auth.service.impl';
import { AuthService } from '@modules/auth/application/interfaces/services/auth.service.interface';
import { Err, ID, Ok } from '@inpro-labs/core';
import { mock, MockProxy } from 'jest-mock-extended';
import { UserFactory } from '@test/factories/fake-user.factory';
import { SessionFactory } from '@test/factories/fake-session.factory';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: MockProxy<JwtService>;
  let hashService: MockProxy<HashService>;
  let userRepository: MockProxy<UserRepository>;
  let sessionRepository: MockProxy<SessionRepository>;

  beforeEach(async () => {
    jwtService = mock<JwtService>();
    hashService = mock<HashService>();
    userRepository = mock<UserRepository>();
    sessionRepository = mock<SessionRepository>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useClass: AuthServiceImpl,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
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

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUserCredentials', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should validate user credentials successfully', async () => {
      const user = UserFactory.make('user-123');

      userRepository.findByEmail.mockResolvedValue(Ok(user));

      hashService.compareHash.mockResolvedValue(Ok(true));

      const result = await service.validateUserCredentials(password, email);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(user);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(hashService.compareHash).toHaveBeenCalled();
    });

    it('should return error when user is not found', async () => {
      userRepository.findByEmail.mockResolvedValue(
        Err(new Error('User not found')),
      );

      const result = await service.validateUserCredentials(password, email);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Invalid credentials');

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(hashService.compareHash).not.toHaveBeenCalled();
    });

    it('should return error when passwords do not match', async () => {
      const user = UserFactory.make('user-123');

      userRepository.findByEmail.mockResolvedValue(Ok(user));

      hashService.compareHash.mockResolvedValue(Ok(false));

      const result = await service.validateUserCredentials(password, email);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Invalid credentials');

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(hashService.compareHash).toHaveBeenCalled();
    });
  });

  describe('generateTokens', () => {
    const sessionId = 'session-123';

    it('should generate tokens successfully', () => {
      const user = UserFactory.make('user-123');

      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      jwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: '5m',
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: '7d',
        JWT_SECRET: 'test-secret',
      };

      const result = service.generateTokens(sessionId, user);

      expect(result.isOk()).toBe(true);
      const tokens = result.unwrap();
      expect(tokens.accessToken).toBe(accessToken);
      expect(tokens.refreshToken).toBe(refreshToken);

      expect(jwtService.sign).toHaveBeenCalledTimes(2);

      process.env = originalEnv;
    });
  });

  describe('getRefreshTokenSession', () => {
    const refreshToken = 'refresh-token';
    const hashedToken = 'hashed-refresh-token';

    it('should retrieve session and user by refresh token', async () => {
      const session = SessionFactory.make('session-123').unwrap();
      const user = UserFactory.make('user-123');

      hashService.generateHash.mockResolvedValue(Ok(hashedToken));

      sessionRepository.findByRefreshToken.mockResolvedValue(Ok(session));

      Object.defineProperty(session, 'isExpired', { get: () => false });
      Object.defineProperty(session, 'isRevoked', { get: () => false });

      userRepository.findById.mockResolvedValue(Ok(user));

      const mockIdValue = jest.fn().mockReturnValue('user-123');
      jest.spyOn(ID.prototype, 'value').mockImplementation(mockIdValue);

      const result = await service.getRefreshTokenSession(refreshToken);

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

      const result = await service.getRefreshTokenSession(refreshToken);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Invalid refresh token');

      expect(sessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        hashedToken,
      );
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should return error for expired or revoked session', async () => {
      const session = SessionFactory.make('session-123').unwrap();

      hashService.generateHash.mockResolvedValue(Ok(hashedToken));

      sessionRepository.findByRefreshToken.mockResolvedValue(Ok(session));

      Object.defineProperty(session, 'isExpired', { get: () => true });

      const result = await service.getRefreshTokenSession(refreshToken);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Session is invalid');

      expect(hashService.generateHash).toHaveBeenCalledWith(refreshToken);
      expect(sessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        hashedToken,
      );
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should return error when user is not found', async () => {
      const session = SessionFactory.make('session-123').unwrap();

      hashService.generateHash.mockResolvedValue(Ok(hashedToken));

      sessionRepository.findByRefreshToken.mockResolvedValue(Ok(session));

      Object.defineProperty(session, 'isExpired', { get: () => false });
      Object.defineProperty(session, 'isRevoked', { get: () => false });

      userRepository.findById.mockResolvedValue(
        Err(new Error('User not found')),
      );

      const mockIdValue = jest.fn().mockReturnValue('user-123');
      jest.spyOn(ID.prototype, 'value').mockImplementation(mockIdValue);

      const result = await service.getRefreshTokenSession(refreshToken);

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
