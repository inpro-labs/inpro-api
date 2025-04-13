import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { Result } from '@inpro-labs/api-sdk';

export abstract class SessionRepository {
  abstract save(session: Session): Promise<Result<Session>>;
  abstract findActiveSessionByDeviceId(
    deviceId: string,
  ): Promise<Result<Session>>;
  abstract findByRefreshToken(refreshToken: string): Promise<Result<Session>>;
  abstract findById(id: string): Promise<Result<Session>>;
  abstract findAllByUserId(userId: string): Promise<Result<Session[]>>;
}
