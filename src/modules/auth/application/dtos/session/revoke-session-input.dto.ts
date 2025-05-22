import { revokeSessionSchema } from '@modules/auth/presentation/schemas/session/revoke-session.schema';
import { z } from 'zod';

export type RevokeSessionInputDTO = z.infer<typeof revokeSessionSchema>;
