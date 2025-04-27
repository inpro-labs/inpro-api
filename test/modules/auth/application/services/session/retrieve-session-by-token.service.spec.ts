import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Err, Ok } from '@inpro-labs/core';
import { mock, MockProxy } from 'jest-mock-extended';
import { SessionFactory } from '@test/factories/fake-session.factory';
import { RetrieveSessionByTokenService } from '@modules/auth/application/services/session/retrieve-session-by-token.service';

describe('RetrieveSessionByTokenService', () => {
  let service: RetrieveSessionByTokenService;
  let jwtService: MockProxy<JwtService>;
  let sessionRepository: MockProxy<SessionRepository>;

  beforeEach(async () => {
    jwtService = mock<JwtService>();
    sessionRepository = mock<SessionRepository>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrieveSessionByTokenService,
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: SessionRepository,
          useValue: sessionRepository,
        },
      ],
    }).compile();

    service = module.get<RetrieveSessionByTokenService>(
      RetrieveSessionByTokenService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const accessToken = 'valid-access-token';
    const sessionId = 'session-123';
    const userId = 'user-123';
    const deviceId = 'device-123';

    it('should retrieve a session by token successfully', async () => {
      // Create a mock session
      const session = SessionFactory.make(sessionId).unwrap();

      // Mock JWT verification to return decoded token
      jwtService.verifyAsync.mockResolvedValue({
        sub: userId,
        sid: sessionId,
        deviceId,
      });

      // Mock session repository to return session
      sessionRepository.findDeviceSession.mockResolvedValue(Ok(session));

      // Setup session properties to be valid
      Object.defineProperty(session, 'isExpired', { get: () => false });
      Object.defineProperty(session, 'isRevoked', { get: () => false });

      // Call the method
      const result = await service.execute(accessToken);

      // Verify the result
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(session);

      // Verify the mocks were called correctly
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(accessToken);
      expect(sessionRepository.findDeviceSession).toHaveBeenCalledWith(
        sessionId,
        userId,
        deviceId,
      );
    });

    it('should return error for invalid token', async () => {
      // Mock JWT verification to throw an error
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // Call the method
      const result = await service.execute(accessToken);

      // Verify the result
      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Invalid token');

      // Session repository should not be called
      expect(sessionRepository.findDeviceSession).not.toHaveBeenCalled();
    });

    it('should return error when session is not found', async () => {
      // Mock JWT verification to return decoded token
      jwtService.verifyAsync.mockResolvedValue({
        sub: userId,
        sid: sessionId,
        deviceId,
      });

      // Mock session repository to return error
      sessionRepository.findDeviceSession.mockResolvedValue(
        Err(new Error('Session not found')),
      );

      // Call the method
      const result = await service.execute(accessToken);

      // Verify the result
      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Session not found');

      // Verify the mocks were called correctly
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(accessToken);
      expect(sessionRepository.findDeviceSession).toHaveBeenCalledWith(
        sessionId,
        userId,
        deviceId,
      );
    });

    it('should return error for expired session', async () => {
      // Create a mock session
      const session = SessionFactory.make(sessionId).unwrap();

      // Mock JWT verification to return decoded token
      jwtService.verifyAsync.mockResolvedValue({
        sub: userId,
        sid: sessionId,
        deviceId,
      });

      // Mock session repository to return session
      sessionRepository.findDeviceSession.mockResolvedValue(Ok(session));

      // Setup session to be expired
      Object.defineProperty(session, 'isExpired', { get: () => true });
      Object.defineProperty(session, 'isRevoked', { get: () => false });

      // Call the method
      const result = await service.execute(accessToken);

      // Verify the result
      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Session expired');

      // Verify the mocks were called correctly
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(accessToken);
      expect(sessionRepository.findDeviceSession).toHaveBeenCalledWith(
        sessionId,
        userId,
        deviceId,
      );
    });

    it('should return error for revoked session', async () => {
      // Create a mock session
      const session = SessionFactory.make(sessionId).unwrap();

      // Mock JWT verification to return decoded token
      jwtService.verifyAsync.mockResolvedValue({
        sub: userId,
        sid: sessionId,
        deviceId,
      });

      // Mock session repository to return session
      sessionRepository.findDeviceSession.mockResolvedValue(Ok(session));

      // Setup session to be revoked
      Object.defineProperty(session, 'isExpired', { get: () => false });
      Object.defineProperty(session, 'isRevoked', { get: () => true });

      // Call the method
      const result = await service.execute(accessToken);

      // Verify the result
      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Session revoked');

      // Verify the mocks were called correctly
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(accessToken);
      expect(sessionRepository.findDeviceSession).toHaveBeenCalledWith(
        sessionId,
        userId,
        deviceId,
      );
    });
  });
});
