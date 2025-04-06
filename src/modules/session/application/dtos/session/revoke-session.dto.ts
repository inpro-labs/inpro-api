import { RevokeSessionSchema } from '@modules/session/presentation/schemas/revoke-session.schema';
import { z } from 'zod';

export type RevokeSessionDto = z.infer<typeof RevokeSessionSchema>;
