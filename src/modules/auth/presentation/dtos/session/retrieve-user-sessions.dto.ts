import { createZodDto } from '@anatine/zod-nestjs';
import { retrieveUserSessionsQuerySchema } from '../../schemas/session/retrieve-user-sessions.schema';

export class RetrieveUserSessionsQueryDTO extends createZodDto(
  retrieveUserSessionsQuerySchema,
) {}
