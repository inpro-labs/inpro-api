import { Test, TestingModule } from '@nestjs/testing';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Err, Ok } from '@inpro-labs/core';
import { mock, MockProxy } from 'jest-mock-extended';
import { SessionFactory } from '@test/factories/fake-session.factory';
import { RetrieveSessionByTokenService } from '@modules/auth/application/services/session/retrieve-session-by-token.service';
import { JwtService } from '@shared/domain/interfaces/jwt.service.interface';
import { TokenPayloadFactory } from '@test/factories/fake-token-payload.factory';

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
    const validTokenPayload = TokenPayloadFactory.make({
      sub: 'user-123',
      sid: 'session-123',
      deviceId: 'device-123',
    }).unwrap();

    const sessionId = 'session-123';
    const userId = 'user-123';
    const deviceId = 'device-123';
    const validSession = SessionFactory.make({
      id: sessionId,
      deviceId,
      userId,
    }).unwrap();
    const accessToken = 'valid-access-token';

    it('should retrieve a session by token successfully', async () => {
      jwtService.verify.mockReturnValue(Ok(validTokenPayload));
      sessionRepository.findDeviceSession.mockResolvedValue(Ok(validSession));

      const result = await service.execute(accessToken);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual(validSession);

      expect(jwtService.verify).toHaveBeenCalledWith(accessToken);
      expect(sessionRepository.findDeviceSession).toHaveBeenCalledWith(
        sessionId,
        userId,
        deviceId,
      );
    });

    it('should return error for invalid token', async () => {
      jwtService.verify.mockReturnValue(Err(new Error('Invalid token')));

      const result = await service.execute(accessToken);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Invalid token');

      expect(sessionRepository.findDeviceSession).not.toHaveBeenCalled();
    });

    it('should return error when session is not found', async () => {
      jwtService.verify.mockReturnValue(Ok(validTokenPayload));
      sessionRepository.findDeviceSession.mockResolvedValue(
        Err(new Error('Session not found')),
      );

      const result = await service.execute(accessToken);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Session not found');

      expect(jwtService.verify).toHaveBeenCalledWith(accessToken);
      expect(sessionRepository.findDeviceSession).toHaveBeenCalledWith(
        sessionId,
        userId,
        deviceId,
      );
    });

    it('should return error for expired session', async () => {
      const expiredSession = SessionFactory.make({
        id: sessionId,
        deviceId,
        userId,
        expiresAt: new Date(Date.now() - 1000),
      }).unwrap();

      jwtService.verify.mockReturnValue(Ok(validTokenPayload));

      sessionRepository.findDeviceSession.mockResolvedValue(Ok(expiredSession));

      const result = await service.execute(accessToken);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Session expired');

      expect(jwtService.verify).toHaveBeenCalledWith(accessToken);
      expect(sessionRepository.findDeviceSession).toHaveBeenCalledWith(
        sessionId,
        userId,
        deviceId,
      );
    });

    it('should return error for revoked session', async () => {
      const invalidSession = SessionFactory.make({
        id: 'session-123',
        revokedAt: new Date(Date.now() - 1000),
      }).unwrap();

      jwtService.verify.mockReturnValue(Ok(validTokenPayload));

      sessionRepository.findDeviceSession.mockResolvedValue(Ok(invalidSession));

      const result = await service.execute(accessToken);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Session revoked');

      expect(jwtService.verify).toHaveBeenCalledWith(accessToken);
      expect(sessionRepository.findDeviceSession).toHaveBeenCalledWith(
        sessionId,
        userId,
        deviceId,
      );
    });
  });
});
