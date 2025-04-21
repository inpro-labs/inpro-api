/* eslint-disable @typescript-eslint/unbound-method */
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
    // Create mocks
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
      // Create a mock user
      const user = UserFactory.make('user-123');

      // Mock repository to return the user
      userRepository.findByEmail.mockResolvedValue(Ok(user));

      // Mock hash service to return true for comparison
      hashService.compareHash.mockResolvedValue(Ok(true));

      // Call the method
      const result = await service.validateUserCredentials(password, email);

      // Verify the result
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(user);

      // Verify the mocks were called correctly
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(hashService.compareHash).toHaveBeenCalled();
    });

    it('should return error when user is not found', async () => {
      // Mock repository to return error
      userRepository.findByEmail.mockResolvedValue(
        Err(new Error('User not found')),
      );

      // Call the method
      const result = await service.validateUserCredentials(password, email);

      // Verify the result
      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Invalid credentials');

      // Verify the repository was called
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      // Hash service should not be called
      expect(hashService.compareHash).not.toHaveBeenCalled();
    });

    it('should return error when passwords do not match', async () => {
      // Create a mock user
      const user = UserFactory.make('user-123');

      // Mock repository to return the user
      userRepository.findByEmail.mockResolvedValue(Ok(user));

      // Mock hash service to return false for comparison
      hashService.compareHash.mockResolvedValue(Ok(false));

      // Call the method
      const result = await service.validateUserCredentials(password, email);

      // Verify the result
      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Invalid credentials');

      // Verify the mocks were called correctly
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(hashService.compareHash).toHaveBeenCalled();
    });
  });

  describe('generateTokens', () => {
    const sessionId = 'session-123';

    it('should generate tokens successfully', () => {
      // Create a mock user
      const user = UserFactory.make('user-123');

      // Expected tokens
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      // Mock JWT service
      jwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      // Mock environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: '5m',
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: '7d',
        JWT_SECRET: 'test-secret',
      };

      // Call the method
      const result = service.generateTokens(sessionId, user);

      // Verify the result
      expect(result.isOk()).toBe(true);
      const tokens = result.unwrap();
      expect(tokens.accessToken).toBe(accessToken);
      expect(tokens.refreshToken).toBe(refreshToken);

      // Verify JWT service was called correctly
      expect(jwtService.sign).toHaveBeenCalledTimes(2);

      // Restore environment
      process.env = originalEnv;
    });
  });

  describe('getRefreshTokenSession', () => {
    const refreshToken = 'refresh-token';
    const hashedToken = 'hashed-refresh-token';

    it('should retrieve session and user by refresh token', async () => {
      // Create mock session and user
      const session = SessionFactory.make('session-123').unwrap();
      const user = UserFactory.make('user-123');

      // Mock hash service to return hashed token
      hashService.generateHash.mockResolvedValue(Ok(hashedToken));

      // Mock session repository to return session
      sessionRepository.findByRefreshToken.mockResolvedValue(Ok(session));

      // Setup session properties to be valid
      Object.defineProperty(session, 'isExpired', { get: () => false });
      Object.defineProperty(session, 'isRevoked', { get: () => false });

      // Mock user repository to return user
      userRepository.findById.mockResolvedValue(Ok(user));

      // Mock ID value method
      const mockIdValue = jest.fn().mockReturnValue('user-123');
      jest.spyOn(ID.prototype, 'value').mockImplementation(mockIdValue);

      // Call the method
      const result = await service.getRefreshTokenSession(refreshToken);

      // Verify the result
      expect(result.isOk()).toBe(true);
      const data = result.unwrap();
      expect(data.session).toBe(session);
      expect(data.user).toBe(user);

      // Verify the mocks were called correctly
      expect(hashService.generateHash).toHaveBeenCalledWith(refreshToken);
      expect(sessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        hashedToken,
      );
      expect(userRepository.findById).toHaveBeenCalled();
    });

    it('should return error for invalid refresh token', async () => {
      // Mock hash service to return hashed token
      hashService.generateHash.mockResolvedValue(Ok(hashedToken));

      // Mock session repository to return error
      sessionRepository.findByRefreshToken.mockResolvedValue(
        Err(new Error('Session not found')),
      );

      // Call the method
      const result = await service.getRefreshTokenSession(refreshToken);

      // Verify the result
      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Invalid refresh token');

      // Verify the repository was called
      expect(sessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        hashedToken,
      );
      // User repository should not be called
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should return error for expired or revoked session', async () => {
      // Create mock session
      const session = SessionFactory.make('session-123').unwrap();

      // Mock hash service to return hashed token
      hashService.generateHash.mockResolvedValue(Ok(hashedToken));

      // Mock session repository to return session
      sessionRepository.findByRefreshToken.mockResolvedValue(Ok(session));

      // Setup session to be expired
      Object.defineProperty(session, 'isExpired', { get: () => true });

      // Call the method
      const result = await service.getRefreshTokenSession(refreshToken);

      // Verify the result
      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Session is invalid');

      // Verify the mocks were called correctly
      expect(hashService.generateHash).toHaveBeenCalledWith(refreshToken);
      expect(sessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        hashedToken,
      );
      // User repository should not be called
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should return error when user is not found', async () => {
      // Create mock session
      const session = SessionFactory.make('session-123').unwrap();

      // Mock hash service to return hashed token
      hashService.generateHash.mockResolvedValue(Ok(hashedToken));

      // Mock session repository to return session
      sessionRepository.findByRefreshToken.mockResolvedValue(Ok(session));

      // Setup session properties to be valid
      Object.defineProperty(session, 'isExpired', { get: () => false });
      Object.defineProperty(session, 'isRevoked', { get: () => false });

      // Mock user repository to return error
      userRepository.findById.mockResolvedValue(
        Err(new Error('User not found')),
      );

      // Mock ID value method
      const mockIdValue = jest.fn().mockReturnValue('user-123');
      jest.spyOn(ID.prototype, 'value').mockImplementation(mockIdValue);

      // Call the method
      const result = await service.getRefreshTokenSession(refreshToken);

      // Verify the result
      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('User not found');

      // Verify the mocks were called correctly
      expect(hashService.generateHash).toHaveBeenCalledWith(refreshToken);
      expect(sessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        hashedToken,
      );
      expect(userRepository.findById).toHaveBeenCalled();
    });
  });
});
