import { z } from 'zod';
import { DEVICE_TYPES } from '@shared/constants/devices';

export const SignInEventSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  userId: z.string().uuid(),
  device: z.enum(DEVICE_TYPES.values as [string, ...string[]]),
  deviceId: z.string(),
  userAgent: z.string(),
  ip: z.string(),
  id: z.string().uuid().optional(),
});
