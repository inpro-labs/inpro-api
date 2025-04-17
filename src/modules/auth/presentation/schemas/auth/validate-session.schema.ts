import { z } from 'zod';

export const validateSessionSchema = z.object({
  accessToken: z.string(),
});
