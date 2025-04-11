import { ListUserSessionsSchema } from '@modules/auth/presentation/schemas/list-user-sessions.schema';
import { z } from 'zod';

export type ListUserSessionsDto = z.infer<typeof ListUserSessionsSchema>;
