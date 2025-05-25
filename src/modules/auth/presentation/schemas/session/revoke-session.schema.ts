import { z } from 'zod';

export const revokeSessionSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
});
