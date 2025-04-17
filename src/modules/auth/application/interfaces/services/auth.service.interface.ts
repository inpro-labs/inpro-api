import { Result } from '@inpro-labs/core';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';

export abstract class AuthService {
  abstract validateUserCredentials(
    email: string,
    password: string,
  ): Promise<Result<User>>;
  abstract generateTokens(
    sessionId: string,
    user: User,
  ): Result<{ accessToken: string; refreshToken: string }>;
  abstract getRefreshTokenSession(
    refreshToken: string,
  ): Promise<Result<{ session: Session; user: User }>>;
}
