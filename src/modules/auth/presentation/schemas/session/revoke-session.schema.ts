import { z } from 'zod';

export const revokeSessionSchema = z.object({
  sessionId: z.string().uuid(),
});
