import { Session } from '@modules/auth/domain/aggregates/session.aggregate';

export type CreateSessionInputDTO = {
  expiresAt?: Date;
  refreshToken: string;
  id?: string;
  userId: string;
  device: string;
  deviceId: string;
  userAgent: string;
  ip: string;
};

export type CreateSessionOutputDTO = Session;
