import { Ok, Result } from '@inpro-labs/core';
import { Injectable } from '@nestjs/common';
import { ISessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { RefreshTokenHash } from '@modules/auth/domain/value-objects/refresh-token-hash.value-object';
import { EncryptService } from '@shared/domain/interfaces/encrypt.service.interface';

@Injectable()
export class UpdateSessionRefreshTokenService {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly encryptService: EncryptService,
  ) {}

  async execute(session: Session, refreshToken: string): Promise<Result<void>> {
    const refreshTokenDigest =
      this.encryptService.generateHmacDigest(refreshToken);

    const refreshTokenHash = RefreshTokenHash.create(
      refreshTokenDigest.unwrap(),
    ).unwrap();

    session.refresh(refreshTokenHash);

    await this.sessionRepository.save(session);

    return Ok(undefined);
  }
}
