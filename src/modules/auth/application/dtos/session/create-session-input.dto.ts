import { CreateSessionSchema } from '@modules/auth/presentation/schemas/session/create-session.schema';
import { z } from 'zod';

export type CreateSessionInputDTO = z.infer<typeof CreateSessionSchema> & {
  expiresAt?: Date;
  refreshToken: string;
  id?: string;
};
