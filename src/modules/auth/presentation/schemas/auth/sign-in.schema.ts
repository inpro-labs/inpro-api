import { z } from 'zod';
import { DEVICE_TYPES } from '@shared/constants/devices';

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  device: z.enum(DEVICE_TYPES.values as [string, ...string[]]),
  deviceId: z.string(),
});
