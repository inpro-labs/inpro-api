export type RefreshTokenOutputDTO = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
};

export type RefreshTokenInputDTO = {
  refreshToken: string;
};
