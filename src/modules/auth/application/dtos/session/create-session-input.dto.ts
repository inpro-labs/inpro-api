import { createSessionSchema } from '@modules/auth/presentation/schemas/session/create-session.schema';
import { z } from 'zod';

export type CreateSessionInputDTO = z.infer<typeof createSessionSchema> & {
  expiresAt?: Date;
  refreshToken: string;
  id?: string;
};
