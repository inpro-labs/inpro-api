export interface SessionListViewModel {
  id: string;
  device: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastRefreshAt: Date | null;
}
