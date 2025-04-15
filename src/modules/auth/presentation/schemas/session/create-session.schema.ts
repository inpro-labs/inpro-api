import { DEVICE_TYPES } from '@shared/constants/devices';
import { z } from 'zod';

export const CreateSessionSchema = z.object({
  userId: z.string().uuid(),
  device: z.enum(DEVICE_TYPES.values as [string, ...string[]]),
  deviceId: z.string(),
  userAgent: z.string(),
  ip: z.string(),
  refreshToken: z.string(),
  id: z.string().uuid().optional(),
  expiresAt: z.date().optional(),
});
