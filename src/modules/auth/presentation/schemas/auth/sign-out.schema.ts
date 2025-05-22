import { z } from 'zod';

export const signOutSchema = z.object({
  accessToken: z
    .string()
    .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/),
});
