import { RevokeSessionSchema } from '@modules/auth/presentation/schemas/session/revoke-session.schema';
import { z } from 'zod';

export type RevokeSessionDto = z.infer<typeof RevokeSessionSchema>;
