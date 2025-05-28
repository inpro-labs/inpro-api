import { revokeSessionSchema } from '@modules/auth/presentation/schemas/session/revoke-session.schema';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { z } from 'zod';

export type RevokeSessionInputDTO = z.infer<typeof revokeSessionSchema>;

export type RevokeSessionOutputDTO = Session;
