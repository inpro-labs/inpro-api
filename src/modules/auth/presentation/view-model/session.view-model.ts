export interface SessionViewModel {
  id: string;
  device: string;
  userAgent: string;
  userId: string;
  ip: string;
  expiresAt: Date;
  deviceId: string;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastRefreshAt: Date | null;
}
