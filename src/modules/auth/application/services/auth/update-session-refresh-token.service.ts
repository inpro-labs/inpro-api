import { Ok, Result } from '@inpro-labs/core';
import { Injectable } from '@nestjs/common';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { HashService } from '@shared/domain/interfaces/hash.service.interface';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { RefreshTokenHash } from '@modules/auth/domain/value-objects/refresh-token-hash.value-object';

@Injectable()
export class UpdateSessionRefreshTokenService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(session: Session, refreshToken: string): Promise<Result<void>> {
    const refreshTokenDigest = this.hashService.generateHmac(refreshToken);

    console.log('new refresh token', refreshTokenDigest.unwrap());

    const refreshTokenHash = RefreshTokenHash.create(
      refreshTokenDigest.unwrap(),
    ).unwrap();

    session.refresh(refreshTokenHash);

    await this.sessionRepository.save(session);

    return Ok(undefined);
  }
}
