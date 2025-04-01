export interface SessionViewModel {
  id: string;
  device: string;
  userAgent: string;
  ip: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
}
