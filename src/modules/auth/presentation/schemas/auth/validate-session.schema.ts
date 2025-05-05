import { z } from 'zod';

export const validateSessionSchema = z.object({
  accessToken: z
    .string()
    .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/),
});
