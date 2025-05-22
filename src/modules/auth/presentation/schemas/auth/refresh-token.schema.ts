import { z } from 'zod';

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/),
});
