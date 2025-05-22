import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { Result } from '@inpro-labs/core';

export abstract class ISessionRepository {
  abstract save(session: Session): Promise<Result<Session>>;
  abstract findActiveSession(
    deviceId: string,
    userId: string,
  ): Promise<Result<Session>>;
  abstract findByRefreshToken(refreshToken: string): Promise<Result<Session>>;
  abstract findById(id: string): Promise<Result<Session>>;
  abstract findDeviceSession(
    id: string,
    userId: string,
    deviceId: string,
  ): Promise<Result<Session>>;
  abstract findAllByUserId(userId: string): Promise<Result<Session[]>>;
  abstract delete(id: string): Promise<Result<void>>;
}
