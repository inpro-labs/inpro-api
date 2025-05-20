import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '@modules/account/domain/interfaces/repositories/user.repository.interface';
import { ISessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Err, ID, Ok } from '@inpro-labs/core';
import { mock, MockProxy } from 'jest-mock-extended';
import { UserFactory } from '@test/factories/fake-user.factory';
import { SessionFactory } from '@test/factories/fake-session.factory';
import { GetRefreshTokenSessionService } from '@modules/auth/application/services/auth/get-refresh-token-session.service';
import { EncryptService } from '@shared/domain/interfaces/encrypt.service.interface';
import { JwtService } from '@shared/domain/interfaces/jwt.service.interface';
import { TokenPayloadFactory } from '@test/factories/fake-token-payload.factory';

describe('GetRefreshTokenSessionService', () => {
  let service: GetRefreshTokenSessionService;
  let encryptService: MockProxy<EncryptService>;
  let userRepository: MockProxy<IUserRepository>;
  let sessionRepository: MockProxy<ISessionRepository>;
  let jwtService: MockProxy<JwtService>;

  beforeEach(async () => {
    encryptService = mock<EncryptService>();
    userRepository = mock<IUserRepository>();
    sessionRepository = mock<ISessionRepository>();
    jwtService = mock<JwtService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRefreshTokenSessionService,
        {
          provide: EncryptService,
          useValue: encryptService,
        },
        {
          provide: IUserRepository,
          useValue: userRepository,
        },
        {
          provide: ISessionRepository,
          useValue: sessionRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
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

  const validSession = SessionFactory.make({ id: 'session-123' }).unwrap();
  const validUser = UserFactory.make('user-123');
  const tokenPayload = TokenPayloadFactory.make({
    sub: validUser.id.value(),
    sid: validSession.id.value(),
  }).unwrap();

  describe('execute', () => {
    const refreshToken = 'refresh-token';
    const hashedToken = 'hashed-refresh-token';

    it('should retrieve session and user by refresh token', async () => {
      encryptService.generateHmacDigest.mockReturnValue(Ok(hashedToken));
      encryptService.compareHmacDigests.mockReturnValue(Ok(true));
      jwtService.verify.mockReturnValue(Ok(tokenPayload));
      sessionRepository.findById.mockResolvedValue(Ok(validSession));
      userRepository.findById.mockResolvedValue(Ok(validUser));

      const mockIdValue = jest.fn().mockReturnValue('user-123');
      jest.spyOn(ID.prototype, 'value').mockImplementation(mockIdValue);

      const result = await service.execute(refreshToken);

      expect(result.isOk()).toBe(true);
      const data = result.unwrap();
      expect(data.session).toBe(validSession);
      expect(data.user).toBe(validUser);

      expect(encryptService.generateHmacDigest).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(sessionRepository.findById).toHaveBeenCalledWith(
        tokenPayload.get('sid'),
      );
      expect(userRepository.findById).toHaveBeenCalledWith(
        tokenPayload.get('sub'),
      );
    });

    it('should return error for invalid refresh token', async () => {
      encryptService.compareHmacDigests.mockReturnValue(Ok(true));
      jwtService.verify.mockReturnValue(
        Err(new Error('Invalid refresh token')),
      );
      sessionRepository.findById.mockResolvedValue(
        Err(new Error('Session not found')),
      );

      const result = await service.execute(refreshToken);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Invalid refresh token');

      expect(sessionRepository.findById).not.toHaveBeenCalled();
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should return error for expired or revoked session', async () => {
      const session = SessionFactory.make({
        id: 'session-123',
        expiresAt: new Date(Date.now() - 1000),
        revokedAt: new Date(Date.now() - 1000),
      }).unwrap();

      encryptService.compareHmacDigests.mockReturnValue(Ok(true));
      encryptService.generateHmacDigest.mockReturnValue(Ok(hashedToken));
      jwtService.verify.mockReturnValue(Ok(tokenPayload));
      sessionRepository.findById.mockResolvedValue(Ok(session));

      const result = await service.execute(refreshToken);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('Session is invalid');

      expect(encryptService.compareHmacDigests).toHaveBeenCalledWith(
        hashedToken,
        session.get('refreshTokenHash').get('value'),
      );
      expect(sessionRepository.findById).toHaveBeenCalledWith(
        tokenPayload.get('sid'),
      );
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should return error when user is not found', async () => {
      encryptService.compareHmacDigests.mockReturnValue(Ok(true));
      encryptService.generateHmacDigest.mockReturnValue(Ok(hashedToken));
      jwtService.verify.mockReturnValue(Ok(tokenPayload));
      sessionRepository.findById.mockResolvedValue(Ok(validSession));

      userRepository.findById.mockResolvedValue(
        Err(new Error('User not found')),
      );

      const mockIdValue = jest.fn().mockReturnValue('user-123');
      jest.spyOn(ID.prototype, 'value').mockImplementation(mockIdValue);

      const result = await service.execute(refreshToken);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()?.message).toBe('User not found');

      expect(encryptService.compareHmacDigests).toHaveBeenCalledWith(
        hashedToken,
        validSession.get('refreshTokenHash').get('value'),
      );
      expect(sessionRepository.findById).toHaveBeenCalledWith(
        tokenPayload.get('sid'),
      );
      expect(userRepository.findById).toHaveBeenCalledWith(
        tokenPayload.get('sub'),
      );
    });
  });
});
