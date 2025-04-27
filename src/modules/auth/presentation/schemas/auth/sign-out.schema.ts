import { z } from 'zod';

export const signOutSchema = z.object({
  accessToken: z.string(),
});
