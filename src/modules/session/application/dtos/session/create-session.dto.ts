import { CreateSessionSchema } from '@modules/session/presentation/schemas/create-session.schema';
import { z } from 'zod';

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
