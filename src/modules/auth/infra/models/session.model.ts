export type SessionModel = {
  _id: string;
  userId: string;
  device: string;
  deviceId: string;
  ip: string;
  userAgent: string;
  refreshTokenDigest: string;
  revokedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  lastRefreshAt: Date | null;
};
