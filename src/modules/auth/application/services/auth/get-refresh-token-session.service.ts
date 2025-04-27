import { Err, Ok, Result } from '@inpro-labs/core';
import { Injectable } from '@nestjs/common';
import { HashService } from '@shared/domain/interfaces/hash.service.interface';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { UserRepository } from '@modules/account/domain/interfaces/repositories/user.repository.interface';

@Injectable()
export class GetRefreshTokenSessionService {
  constructor(
    private readonly hashService: HashService,
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<Result<{ session: Session; user: User }>> {
    const hashedRefreshToken =
      await this.hashService.generateHash(refreshToken);

    const sessionResult = await this.sessionRepository.findByRefreshToken(
      hashedRefreshToken.unwrap(),
    );

    if (sessionResult.isErr()) {
      return Err(new Error('Invalid refresh token'));
    }

    const session = sessionResult.unwrap();

    if (session.isExpired || session.isRevoked) {
      return Err(new Error('Session is invalid'));
    }

    const user = await this.userRepository.findById(
      session.get('userId').value(),
    );

    if (user.isErr()) {
      return Err(new Error('User not found'));
    }

    return Ok({ session, user: user.unwrap() });
  }
}
