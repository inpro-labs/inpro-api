import { listUserSessionsSchema } from '@modules/auth/presentation/schemas/session/list-user-sessions.schema';
import { z } from 'zod';
import { QueryParams } from '@inpro-labs/microservices';

export type ListUserSessionsInputDTO = QueryParams<
  z.infer<typeof listUserSessionsSchema>,
  true
>;
