export interface ValidateSessionOutputDTO {
  isValid: boolean;
  userId: string;
  sessionId: string;
  expiresAt: Date;
}
