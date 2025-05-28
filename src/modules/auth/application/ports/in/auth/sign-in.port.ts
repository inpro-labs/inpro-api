export type SignInInputDTO = {
  email: string;
  password: string;
  device: string;
  deviceId: string;
  ip: string;
  userAgent: string;
};

export type SignInOutputDTO = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
};
