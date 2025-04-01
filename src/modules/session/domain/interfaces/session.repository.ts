import { Session } from '../aggregates/session.aggregate';
import { Result } from '@sputnik-labs/api-sdk';

export interface SessionModel {
  id: string;
  device: string;
  userAgent: string;
  ip: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

export abstract class SessionRepository {
  abstract save(session: Session): Promise<Result<Session>>;
}
