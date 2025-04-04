import { Session } from '../aggregates/session.aggregate';
import { Result } from '@sputnik-labs/api-sdk';

export type SessionModel = {
  id: string;
  userId: string;
  device: string;
  ip: string;
  userAgent: string;
  refreshTokenHash: string;
  revokedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export abstract class SessionRepository {
  abstract save(session: Session): Promise<Result<Session>>;
  abstract findByUserId(userId: string): Promise<Result<Session>>;
  abstract findByRefreshToken(refreshToken: string): Promise<Result<Session>>;
  abstract findById(id: string): Promise<Result<Session>>;
}
