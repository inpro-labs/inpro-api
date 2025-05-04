import { Ok, Result } from '@inpro-labs/core';
import { Injectable } from '@nestjs/common';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { HashService } from '@shared/domain/interfaces/hash.service.interface';

@Injectable()
export class UpdateSessionRefreshTokenService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(
    sessionId: string,
    refreshToken: string,
  ): Promise<Result<void>> {
    const refreshTokenHash = await this.hashService.generateHash(refreshToken);

    await this.sessionRepository.updateRefreshTokenHash(
      sessionId,
      refreshTokenHash.unwrap(),
    );

    return Ok(undefined);
  }
}
