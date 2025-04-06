import { z } from 'zod';

export const ListUserSessionsSchema = z.object({
  userId: z.string().uuid(),
});
