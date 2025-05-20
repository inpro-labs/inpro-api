import { Test, TestingModule } from '@nestjs/testing';
import { Ok, Err } from '@inpro-labs/core';
import { mock, MockProxy } from 'jest-mock-extended';

import { ISessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { EncryptService } from '@shared/domain/interfaces/encrypt.service.interface';
import { RefreshTokenHash } from '@modules/auth/domain/value-objects/refresh-token-hash.value-object';
import { UpdateSessionRefreshTokenService } from '@modules/auth/application/services/auth/update-session-refresh-token.service';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';

describe('UpdateSessionRefreshTokenService', () => {
  let service: UpdateSessionRefreshTokenService;
  let sessionRepository: MockProxy<ISessionRepository>;
  let encryptService: MockProxy<EncryptService>;

  beforeEach(async () => {
    sessionRepository = mock<ISessionRepository>();
    encryptService = mock<EncryptService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateSessionRefreshTokenService,
        { provide: ISessionRepository, useValue: sessionRepository },
        { provide: EncryptService, useValue: encryptService },
      ],
    }).compile();

    service = module.get(UpdateSessionRefreshTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const refreshToken = 'some-refresh-token';

    it('should generate a digest, refresh the session and save it', async () => {
      const digest = 'digest-123';
      encryptService.generateHmacDigest.mockReturnValue(Ok(digest));

      const session = mock<Session>();

      sessionRepository.save.mockResolvedValue(Ok(session));

      const result = await service.execute(session, refreshToken);

      expect(encryptService.generateHmacDigest).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(session.refresh).toHaveBeenCalledWith(
        expect.any(RefreshTokenHash),
      );
      expect(sessionRepository.save).toHaveBeenCalledWith(session);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBeUndefined();
    });

    it('should reject if HMAC generation fails', async () => {
      encryptService.generateHmacDigest.mockReturnValue(
        Err(new Error('hmac failure')),
      );
      const session = mock<Session>();

      await expect(service.execute(session, refreshToken)).rejects.toThrow(
        'hmac failure',
      );

      expect(session.refresh).not.toHaveBeenCalled();
      expect(sessionRepository.save).not.toHaveBeenCalled();
    });
  });
});
