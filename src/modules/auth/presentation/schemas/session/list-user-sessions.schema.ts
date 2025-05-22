import { z } from 'zod';

export const listUserSessionsSchema = z.object({
  userId: z.string().uuid(),
});
