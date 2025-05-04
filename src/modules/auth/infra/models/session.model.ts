export type SessionModel = {
  id: string;
  userId: string;
  device: string;
  deviceId: string;
  ip: string;
  userAgent: string;
  refreshTokenHash: string;
  revokedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  lastRefreshAt: Date | null;
};
