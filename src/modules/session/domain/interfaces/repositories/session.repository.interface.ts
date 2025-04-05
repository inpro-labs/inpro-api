import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { Result } from '@sputnik-labs/api-sdk';

export abstract class SessionRepository {
  abstract save(session: Session): Promise<Result<Session>>;
  abstract findByUserId(userId: string): Promise<Result<Session | null>>;
  abstract findByRefreshToken(
    refreshToken: string,
  ): Promise<Result<Session | null>>;
  abstract findById(id: string): Promise<Result<Session | null>>;
  abstract findAllByUserId(userId: string): Promise<Result<Session[]>>;
}
