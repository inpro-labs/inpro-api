import { DEVICE_TYPES } from '@shared/constants/devices';

export interface CreateSessionDto {
  userId: string;
  device: (typeof DEVICE_TYPES.values)[number];
  deviceId: string;
  userAgent: string;
  ip: string;
}
