import { CreateSessionSchema } from '@modules/auth/presentation/schemas/create-session.schema';
import { z } from 'zod';

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
