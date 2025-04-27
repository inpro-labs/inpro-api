import { z } from 'zod';

export const signOutSchema = z.object({
  sessionId: z.string(),
  userId: z.string().uuid(),
});
