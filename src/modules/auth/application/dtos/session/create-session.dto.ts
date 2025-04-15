import { CreateSessionSchema } from '@modules/auth/presentation/schemas/session/create-session.schema';
import { z } from 'zod';

export type CreateSessionDto = z.infer<typeof CreateSessionSchema> & {
  expiresAt?: Date;
};
