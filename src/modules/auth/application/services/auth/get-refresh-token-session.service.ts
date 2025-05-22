import { Err, Ok, Result } from '@inpro-labs/core';
import { Injectable } from '@nestjs/common';
import { ISessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { IUserRepository } from '@modules/account/domain/interfaces/repositories/user.repository.interface';
import { IJwtService } from '@shared/security/jwt/interfaces/jwt.service.interface';
import { IEncryptService } from '@shared/security/encrypt/interfaces/encrypt.service.interface';

@Injectable()
export class GetRefreshTokenSessionService {
  constructor(
    private readonly encryptService: IEncryptService,
    private readonly jwtService: IJwtService,
    private readonly sessionRepository: ISessionRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<Result<{ session: Session; user: User }>> {
    const tokenPayload = this.jwtService.verify(refreshToken);

    if (tokenPayload.isErr()) {
      return Err(new Error('Invalid refresh token'));
    }

    const sessionResult = await this.sessionRepository.findById(
      tokenPayload.unwrap().get('sid'),
    );

    if (sessionResult.isErr()) {
      return Err(new Error('Invalid refresh token'));
    }

    const session = sessionResult.unwrap();

    const refreshTokenDigest =
      this.encryptService.generateHmacDigest(refreshToken);

    const isRefreshTokenValid = this.encryptService.compareHmacDigests(
      refreshTokenDigest.unwrap(),
      session.get('refreshTokenDigest').get('value'),
    );

    if (!isRefreshTokenValid.unwrap()) {
      return Err(new Error('Invalid refresh token. Not match'));
    }

    if (
      session.isExpired ||
      session.isRevoked ||
      session.get('userId').value() !== tokenPayload.unwrap().get('sub')
    ) {
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
